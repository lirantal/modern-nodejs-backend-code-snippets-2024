import { ReadableStream } from "node:stream/web";
import fs from "fs";

export function createReadableStreamFromFile(filePath) {
  const stream = new ReadableStream({
    start(controller) {
      const reader = fs.createReadStream(filePath);

      reader.on("data", (chunk) => {
        controller.enqueue(chunk);
        if (reader.readableFlowing === false) {
          reader.resume();
        }
      });

      reader.on("end", () => {
        controller.close();
      });

      reader.on("error", (err) => {
        controller.error(err);
      });
    },
  });

  return stream;
}

export async function consumeStreamWithAsyncIterator(stream) {
  try {
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
  } catch (err) {
    console.error("Error occurred while reading the stream:", err);
  }
}

const filePath = process.argv[2];
const stream = createReadableStreamFromFile(filePath);
consumeStreamWithAsyncIterator(stream);
