import { findUserById } from "../../models/user";

export const getMe = async (req, res) => {
  const userInfos = await findUserById(req.userId)
	console.log("TCL: getMe -> userInfos", userInfos)
  res.json({
    email: userInfos.email,
  })
}
