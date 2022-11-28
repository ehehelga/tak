const Path = require("path");
const MethodOverride = require("method-override");
const Express = require("express");
const EjsMate = require("ejs-mate");
const CatchAsync = require("./utils/catchAsync");
const Fs = require("fs");
const ExpressLayouts = require("express-ejs-layouts");
const Multer = require("multer");
const Storage = Multer.memoryStorage();
const Upload = Multer({ storage: Storage });
const BodyParser = require("body-parser");

const App = Express();
App.set("view engine", "ejs");
App.set("views", Path.join(__dirname, "views"));

App.set("layout", "layout.ejs");
App.engine("ejs", EjsMate);
App.use(Express.urlencoded({ extended: true }));
App.use(MethodOverride("_method"));
App.use(ExpressLayouts);

const SharedFolder = "./files/";

const getList = async (folder) => {
    return await Fs.promises.readdir(folder, (err, files) => {
        const List = [];
        files.forEach((file) => {
            List.push(file);
        });
    });
};

App.get("/", (req, res) => {
    res.redirect("/show/");
});

App.get(
    "/show/*",
    CatchAsync(async (req, res) => {
        let FilePath;
        if (req.url.slice(6) == "") {
            FilePath = `${SharedFolder}${req.url.slice(6)}`;
        } else {
            FilePath = `${SharedFolder}${req.url.slice(6)}/`;
        }
        const FileNames = await getList(FilePath);
        const List = [];
        for (let name of FileNames) {
            let type = "dir";
            if (name.indexOf(".") > -1) {
                type = "file";
            }
            List.push({
                name: name,
                type: type,
            });
        }
        res.render("home", { List, FilePath });
    })
);

App.get("/download/*", (req, res) => {
    let FilePath = Path.join(__dirname, `${req.url.slice(10)}`);
    res.download(FilePath);
});

App.post("/delete", (req, res) => {
    let FilePath = Path.join(__dirname, req.body.path);
    if (Fs.existsSync(FilePath)) {
        Fs.rmSync(FilePath, { recursive: true, force: true });
    }
    res.sendStatus(200);
});

App.use((err, req, res, next) => {
    if (!err.message) err.message = "Error!";
    if (!err.status) err.status = 500;
    const { status } = err;
    res.status(status).render("error", { err });
});

App.listen(3000, () => {
    console.log("Listening оn port 3000");
});
