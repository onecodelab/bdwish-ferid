const axios = require("axios").default;
const path = require("path");
const fs = require("fs");
const setPic = require("./getPic");
const genIndex = require("./genIndex");
const {
  generateMarkupLocal,
  generateMarkupRemote,
} = require("./generateMarkup");

require("dotenv").config();

// Ensure Name and Pic have fallbacks so Vercel builds do not crash
process.env.NAME = process.env.NAME || "Ferid";
process.env.PIC = process.env.PIC || "sample-pic.jpeg";

const picPath = process.env.PIC;
const msgPath = process.env.SCROLL_MSG;

//Local initialization
const setLocalData = async () => {
  try {
    const pic = path.join(__dirname, "../local/", picPath);
    let markup = "";
    if (msgPath) {
      const text = fs.readFileSync(path.join(__dirname, "../local/", msgPath), {
        encoding: "utf-8",
      });
      markup = generateMarkupLocal(text);
    }
    await setPic(pic);
    genIndex(markup);
  } catch (e) {
    throw new Error(e.message);
  }
};

//Remote initialization (Used in cloud build environments like Vercel)
const setRemoteData = async () => {
  try {
    let pic;
    if (picPath && (picPath.startsWith("http://") || picPath.startsWith("https://"))) {
      let res = await axios.get(picPath, {
        responseType: "arraybuffer",
      });
      pic = res.data;
    } else {
      pic = path.join(__dirname, "../local/", picPath || "sample-pic.jpeg");
    }

    let markup = "";
    if (msgPath) {
      if (msgPath.startsWith("http://") || msgPath.startsWith("https://") || !msgPath.endsWith(".txt")) {
        const article = msgPath.split("/").pop();
        const res = await axios.get(
          `https://api.telegra.ph/getPage/${article}?return_content=true`
        );
        const { content } = res.data.result;
        markup = content.reduce(
          (string, node) => string + generateMarkupRemote(node),
          ""
        );
      } else {
        // Fallback to local text file if not a URL
        const text = fs.readFileSync(path.join(__dirname, "../local/", msgPath), {
          encoding: "utf-8",
        });
        markup = generateMarkupLocal(text);
      }
    }
    await setPic(pic);
    genIndex(markup);
  } catch (e) {
    throw new Error(e.message);
  }
};

if (process.argv[2] === "--local") setLocalData();
else if (process.argv[2] === "--remote") setRemoteData();
else console.log("Fetch mode not specified.");
