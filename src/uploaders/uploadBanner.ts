import fs from "fs";
import axios from "axios";
import {imgUploadKey} from "../constants/index.js";

export default async function uploadBanner(
    path: string
) : Promise<string> {
    const banner = fs.readFileSync(path, { encoding: "base64" });
    const upload = await axios.post(`https://api.imgbb.com/1/upload`, {
        image: banner,
        key: imgUploadKey
    });

    return upload.data.url as string;
}