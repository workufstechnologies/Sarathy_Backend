var express = require("express");
var router = express.Router();
var Chat_Window = require("../models/Chat_Window");
const upload = require("../helpers/multer-helper");
//  router.post('/Save_Chat/',function(req,res,next)
//  {
//  try
//  {
// Chat_Window.Save_Chat(req.body, function (err, rows)
//  {
//   if (err)
//   {
//   res.json(err);
//   }
//   else
//   {
//     res.json(rows);
//   }
//   });
//   }
//  catch (e)
//  {
//  }
//  finally
//  {
//  }
//   });
router.post("/Save_Chat", upload.array("myFile"), (req, res, next) => {
	try {
		const file = req.files;
		var Temp_Image = "";
		//console.log(req.body)
		if (!file) {
		} else {
			for (var i = 0; i < req.body.Document_File_Array; i++) {
				if (i == req.body.ImageFile_) Temp_Image = file[i].filename;
			}
			// console.log(req.body.Document_File_Array)
			// console.log(req.body.ImageFile_)
			// console.log(Temp_Image)
			var Msg;
			Msg = {
				message: req.body.Chats,
				From_User: req.body.From_User,
				From_User_Name: req.body.From_User_Name,
				Display_File: req.body.Display_File,
				File_Name: Temp_Image,
				Channel_Id: req.body.Channel_Id,
			};
			var tagged = {
				User_Id: req.body.User_Id,
				User_Details_Name: req.body.User_Details_Name,
			};
			var jsondata1 = JSON.stringify(Msg);
			var jsondata2 = JSON.stringify(tagged);
			// console.log(Msg);
			var Msg_Data = {
				Msg: jsondata1,
				tagged: jsondata2,
			};
			Chat_Window.Save_Chat(Msg_Data, function (err, rows) {
				if (err) {
					console.log(err);
					return 1;
				} else {
					console.log(rows);
					return res.json(rows);
				}
			});
		}
	} catch (err) {
		console.log(err);
		return;
	} finally {
	}
});

router.post("/Save_Comments", upload.array("myFile"), (req, res, next) => {
	try {

		console.log("=== Incoming Request to /Save_Comments ===");
		console.log("Body:", req.body);
		console.log("Files:", req.files);
		
		const file = req.files;
		var Temp_Image = "";
		//console.log(req.body)
		if (!file) {
		} else {
			for (var i = 0; i < req.body.Document_File_Array; i++) {
				if (i == req.body.ImageFile_) Temp_Image = file[i].filename;
			}
			// console.log(req.body.Document_File_Array)
			// console.log(req.body.ImageFile_)
			console.log(req.body.Student_Id)
			console.log(req.body.Application_Details_Id)
			var Msg;
			Msg = {
				message: req.body.Chats,
				From_User: req.body.From_User,
				From_User_Name: req.body.From_User_Name,
				Display_File: req.body.Display_File,
				File_Name: Temp_Image,
				Channel_Id: req.body.Channel_Id,
				Student_Id: req.body.Student_Id,
				 Application_Details_Id: req.body.Application_Details_Id,
			};
			let tagged;
			try {
				tagged = req.body.Tagged_User ? JSON.parse(req.body.Tagged_User) : [];
			} catch (e) {
				tagged = [];
			}
			var jsondata1 = JSON.stringify(Msg);
			var jsondata2 = JSON.stringify(tagged);
			// console.log(Msg);
			var Msg_Data = {
				Msg: jsondata1,
				tagged: jsondata2,
			};
			Chat_Window.Save_Comments(Msg_Data, function (err, rows) {
				if (err) {
					console.log(err);
					return 1;
				} else {
					console.log(rows);
					return res.json(rows);
				}
			});
		}
	} catch (err) {
		console.log(err);
		return;
	} finally {
	}
});

router.post("/Save_Comments_Email", (req, res, next) => {
	try {

		// console.log("=== Incoming Request to /Save_Comments_Email ===");
		// console.log("Body:", req.body);
		// console.log("Files:", req.files);
		
		const file = req.files;
		var Temp_Image = "";
		 
	 
		 {
			
			
			console.log(req.body.Student_Id)
			console.log(req.body.Application_Details_Id)
			var Msg;
			Msg = {
				message: req.body.Chats,
				From_User: req.body.From_User,
				From_User_Name: req.body.From_User_Name,
				Display_File: req.body.Display_File,
				File_Name: Temp_Image,
				Channel_Id: req.body.Channel_Id,
				Student_Id: req.body.Student_Id,
				 Application_Details_Id: req.body.Application_Details_Id,
			};
			let tagged;
			try {
				tagged = req.body.Tagged_User ? JSON.parse(req.body.Tagged_User) : [];
			} catch (e) {
				tagged = [];
			}
			var jsondata1 = JSON.stringify(Msg);
			var jsondata2 = JSON.stringify(tagged);
			
			var Msg_Data = {
				Msg: jsondata1,
				tagged: jsondata2,
			};
			Chat_Window.Save_Comments_Email(Msg_Data, function (err, rows) {
				if (err) {
					console.log(err);
					return 1;
				} else {
					console.log(rows);
					return res.json(rows);
				}
			});
		}
	} catch (err) {
		console.log(err);
		return;
	} finally {
	}
});

router.get("/Get_Chat_Window/:Chat_Window_Id_?", function (req, res, next) {
	try {
		Chat_Window.Get_Chat_Window(
			req.params.Chat_Window_Id_,
			function (err, rows) {
				if (err) {
					res.json(err);
				} else {
					res.json(rows);
				}
			}
		);
	} catch (e) {
	} finally {
	}
});
router.get("/Delete_Chat_Window/:Chat_Window_Id_?", function (req, res, next) {
	try {
		Chat_Window.Delete_Chat_Window(
			req.params.Chat_Window_Id_,
			function (err, rows) {
				if (err) {
					res.json(err);
				} else {
					res.json(rows);
				}
			}
		);
	} catch (e) {
	} finally {
	}
});
router.get(
	"/Load_ChatUser_Details/:Value_?/:Login_User_?",
	function (req, res, next) {
		try {
			Chat_Window.Load_ChatUser_Details(
				req.params.Value_,
				req.params.Login_User_,
				function (err, rows) {
					if (err) {
						res.json(err);
					} else {
						res.json(rows);
					}
				}
			);
		} catch (e) {
		} finally {
		}
	}
);
router.get("/Get_Chats/:Channel_Id_?/:Login_User_?", function (req, res, next) {
	try {
		Chat_Window.Get_Chats(
			req.params.Channel_Id_,
			req.params.Login_User_,
			function (err, rows) {
				if (err) {
					res.json(err);
				} else {
					console.log(rows);
					res.json(rows);
				}
			}
		);
	} catch (e) {
	} finally {
	}
});

router.get(
	"/Load_Exist_Channels/:Selected_User_?/:Login_User_?",
	function (req, res, next) {
		try {
			Chat_Window.Load_Exist_Channels(
				req.params.Selected_User_,
				req.params.Login_User_,
				function (err, rows) {
					if (err) {
						res.json(err);
					} else {
						res.json(rows);
					}
				}
			);
		} catch (e) {
		} finally {
		}
	}
);

router.get("/Load_old_messages/:Channel_Id_Temp_?", function (req, res, next) {
	try {
		Chat_Window.Load_old_messages(req.params.Channel_Id_Temp_,function (err, rows) {
			if (err) {
				res.json(err);
			} else {
				res.json(rows);
			}
		});
	} catch (e) {
	} finally {
	}
});
router.post("/Group_Save/", function (req, res, next) {
	try {
		Chat_Window.Group_Save(req.body, function (err, rows) {
			if (err) {
				console.log(err);
				res.json(err);
			} else {
				console.log(rows);
				res.json(rows);
			}
		});
	} catch (e) {
		console.log(e);
	} finally {
	}
});
router.get("/Load_Channels/:Login_User_Id_?", function (req, res, next) {
	try {
		Chat_Window.Load_Channels(req.params.Login_User_Id_, function (err, rows) {
			if (err) {
				res.json(err);
			} else {
				res.json(rows);
			}
		});
	} catch (e) {
		console.log(e);
	} finally {
	}
});
router.get(
	"/Reset_CurrentChannel_Count/:Channel_Id_Temp_?/:Login_User_?",
	function (req, res, next) {
		try {
			Chat_Window.Reset_CurrentChannel_Count(
				req.params.Channel_Id_Temp_,
				req.params.Login_User_,
				function (err, rows) {
					if (err) {
						res.json(err);
					} else {
						res.json(rows);
					}
				}
			);
		} catch (e) {
			console.log(e);
		} finally {
		}
	}
);
router.get("/Delete_Channel/:Channel_Id_?", function (req, res, next) {
	try {
		Chat_Window.Delete_Channel(req.params.Channel_Id_, function (err, rows) {
			if (err) {
				res.json(err);
			} else {
				res.json(rows);
			}
		});
	} catch (e) {
	} finally {
	}
});
router.get(
	"/Edit_Group/:Channel_Id_?/:Edited_Name_?",
	function (req, res, next) {
		try {
			Chat_Window.Edit_Group(
				req.params.Channel_Id_,
				req.params.Edited_Name_,
				function (err, rows) {
					if (err) {
						res.json(err);
					} else {
						res.json(rows);
					}
				}
			);
		} catch (e) {
		} finally {
		}
	}
);

module.exports = router;
