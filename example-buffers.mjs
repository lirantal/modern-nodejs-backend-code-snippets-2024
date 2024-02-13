import { readFile } from "node:fs/promises";
import OpenAI from "openai";

// Creating an instance of the OpenAI API client
// will automatically use the OPENAI_API_KEY environment variable
const openai = new OpenAI();

const imageBuffer = await readFileToBuffer(process.argv[2]);

if (isImageTypeValid(imageBuffer)) {
  const result = await generateAltTextForImage(imageBuffer);
  console.log(result);
} else {
  console.error("Invalid image type");
}

function isImageTypeValid(imageBuffer) {
  // png magic number in hex array
  const pngSignature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  // the passed buffer file signature
  const fileSignature = imageBuffer.slice(0, 8);

  if (pngSignature.equals(fileSignature)) {
    return true;
  }
}

async function generateAltTextForImage(imageBuffer) {
  const imageInBase64 = imageBuffer.toString("base64");

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What's in this image? generate a simple alt text for an image source in an HTML page",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${imageInBase64}`,
            },
          },
        ],
      },
    ],
  });

  return response.choices[0];
}

async function readFileToBuffer(filePath) {
  return readFile(filePath);
}
