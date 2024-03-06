
import { EngineerModel } from '../../../../DB/Models/Engineer.model.js'
import { sendEmailService } from '../../../services/sendEmailService.js'
import { emailTemplate } from '../../../utils/emailTemplate.js'
import { generateToken, verifyToken } from '../../../utils/tokenFunctions.js'
import cloudinary from '../../../utils/coludinaryConfigrations.js'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('123456', 6)
import pkg from 'bcrypt'

//======================================== SignUp ===========================
export const signUp = async (req, res, next) => {
  const {
    userName,
    email,
    password,
    age,
    gender,
    phoneNumber,
    address,
  } = req.body
  // email check
  if (!req.file) {
    return next(new Error('Please  upload Id pic', { cause: 400 }))

  }
  const isEmailDuplicate = await EngineerModel.findOne({ email })
  if (isEmailDuplicate) {
    return next(new Error('email is already exist', { cause: 400 }))
  }
  const token = generateToken({
    payload: {
      email,

    },
    signature: process.env.CONFIRMATION_EMAIL_TOKEN,

  })
  const conirmationlink = `${req.protocol}://${req.headers.host}/engineer/confirm/${token}`
  const isEmailSent = sendEmailService({
    to: email,
    subject: 'Confirmation Email',
    // message: `<a href=${conirmationlink}>Click here to confirm </a>`,
    message: emailTemplate({
      link: conirmationlink,
      linkData: 'Click here to confirm',
      subject: 'Confirmation Email',
    }),
  })
  if (!isEmailSent) {
    return next(new Error('fail to sent confirmation email', { cause: 400 }))
  }
  const customId = nanoid()
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `folder: ${process.env.PROJECT_FOLDER}/Engineer/ID/${customId}`,
      resource_type: 'image',
    },
  )
  const hashedPassword = pkg.hashSync(password, 8)
  const engineer = new EngineerModel({
    userName,
    email,
    password: hashedPassword,
    age,
    gender,
    phoneNumber,
    address,
    licencePicture: {
      secure_url,
      public_id
    },

  })
  //======destroy pic => ToDo
  const saveEngineer = await engineer.save()
  res.status(201).json({ message: 'Done', saveEngineer })
}

//=============================== confirm email ===============================

export const confirmEmail = async (req, res, next) => {
  const { token } = req.params
  const decode = verifyToken({
    token,
    signature: process.env.CONFIRMATION_EMAIL_TOKEN,
  })
  const engineer = await EngineerModel.findOneAndUpdate(
    { email: decode?.email, isConfirmed: false },
    { isConfirmed: true },
    { new: true },
  )
  if (!engineer) {
    return next(new Error('already confirmed', { cause: 400 }))
  }
  res.status(200).json({ messge: 'Confirmed done, please try to login' })
}

//=============================== Log In ===============================
export const logIn = async (req, res, next) => {
  const { email, password } = req.body
  const engineer = await EngineerModel.findOne({ email })
  if (!engineer) {
    return next(new Error('invalid login credentials', { cause: 400 }))
  }

  const isPassMatch = pkg.compareSync(password, engineer.password)
  if (!isPassMatch) {
    return next(new Error('invalid [login] credentials', { cause: 400 }))
  }

  const token = generateToken({
    payload: {
      email,
      id: engineer._id,

    },
    signature: process.env.SIGN_IN_TOKEN_SECRET,
  })

  const engineerUpdated = await EngineerModel.findOneAndUpdate(
    { email },
    {
      token,
      status: 'Online',
    },
    {
      new: true,
    },
  )
  res.status(200).json({ messge: 'Login done', engineerUpdated })
}
//========================logout======================

export const logOut = async (req, res, next) => {

  const { userid } = req.body

  const userExcest = await EngineerModel.findById(userid)
  if (!userExcest) {
    return res.json({ message: 'invaled user id' })
  }
  if (userExcest._id.toString() !== req.authUser.id) {
    return res.json({ message: 'can not take this action' })
  }
  await EngineerModel.findByIdAndUpdate(req.authUser.id, {
    status: 'Offline'
  })
  res.json({ message: "log out done" })
}

//==================================  AddPost================================ 

export const communityPage = async (req, res, next) => {

  const { id } = req.authUser
  if (!req.files) {
    return next(new Error('please upload pictures', { cause: 400 }))
  }
  const engineer = await EngineerModel.findById(id);
  if (!engineer) {
    return res.status(404).json({ error: 'engineer not found' });
  }

  const Images = []
  const publicIds = []
  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/Engineer/communityPage/${engineer.customId}`,
      },

    )
    Images.push({ secure_url, public_id })
    publicIds.push(public_id)
  }

  const engNew = await EngineerModel.findByIdAndUpdate(
    id,
    {
      Gallery: Images,
    },
    {
      new: true,
    },
  )
  res.status(200).json({ message: 'Done', engNew })
}
//===================================UpdatePost======================


export const updatePost = async (req, res) => {
  const { id } = req.authUser;
  const engineer = await EngineerModel.findById(id);
  if (!engineer) {
    return res.status(404).json({ error: 'engineer not found' });
  }

  // const customId = nanoid()
  if (req.files?.length) {

    let ImageArr = []
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.PROJECT_FOLDER}/Engineer/communityPage/${engineer.customId}`,
        },
      )
      ImageArr.push({ secure_url, public_id })
    }
    let public_ids = []
    for (const image of engineer.Gallery) {
      public_ids.push(image.public_id)
    }
    await cloudinary.api.delete_resources(public_ids)
    engineer.Gallery = ImageArr

  }
  await engineer.save()
  return res.status(400).json({ message: "UpdateDone", engineer });
}
//====================================Delete Post===================
export const deletePost = async (req, res, next) => {
  const { id } = req.authUser

  const engineer = await EngineerModel.findById(id
  )
  let public_ids = []
  let ImageArr = []
  for (const image of engineer.Gallery) {
    public_ids.push(image.public_id)
  }

  if (!(public_ids.length)) {
    return res.status(404).json({ error: 'Not Found Pics' });
  }

  const deleteCloud = await cloudinary.api.delete_all_resources(public_ids)
  if (deleteCloud) {
    engineer.Gallery = ImageArr
  }

  await cloudinary.api.delete_folder(
    `${process.env.PROJECT_FOLDER}/Engineer/communityPage/${engineer.customId}`,
  )

  await engineer.save()
  res.status(200).json({ messsage: 'Deleted Done', engineer })
}

//============================AddProfilePic===========================
// update Information => TO DO
export const profilePic = async (req, res, next) => {
  const { id } = req.authUser

  if (!req.file) {
    return next(new Error('please upload pictures', { cause: 400 }))
  }

  const customId = nanoid()
  const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
    folder: `${process.env.PROJECT_FOLDER}/Engineer/ProfilePic/${customId}`,
    resource_type: 'image'
  })
  const engineer = await EngineerModel.findByIdAndUpdate(id, {
    profilePicture: {
      secure_url,
      public_id,
    },
  },
    {
      new: true,
    },)
  if (engineer) {
    return res.status(200).json({ messege: 'Done', engineer });
  }

}
//=================================GetEngineerInfo===================

export const getEngAccount = async (req, res, next) => {

  const { id } = req.authUser
  console.log(id);
  const engineer = await EngineerModel.findById(id)
  if (engineer) {
    return res.status(200).json({ message: 'done', engineer })
  }
  res.status(404).json({ message: 'in-valid Id' })
}

//==========================GetAllPosts=================================
// export const getAllPosts = async (req, res, next) => {

//   const { id } = req.authUser
  
//   const engineer = await EngineerModel.findById(id)
//   const Posts=engineer.Gallery
//   if (engineer) {
//     return res.status(200).json({ message: 'done', Posts })
//   }
//   res.status(404).json({ message: 'in-valid Id' })
// }
