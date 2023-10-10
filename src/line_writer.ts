interface lineWriterConfig {
  (text: string): Promise<void>;
}

async function lineWriter(cb: (w: lineWriterConfig) => Promise<void>) {
  const store = { lastLine: "" };

  async function writer(text: string): Promise<void> {
    let whitespaceOverBuffer: string;

    if (text.length < store.lastLine.length) {
      whitespaceOverBuffer = " ".repeat(store.lastLine.length - text.length);
    } else {
      whitespaceOverBuffer = "";
    }

    await Deno.write(
      Deno.stdout.rid,
      new TextEncoder().encode(
        `\r${text}${whitespaceOverBuffer}`,
      ),
    );

    store.lastLine = text;
  }

  await cb(writer);
  writer("\n");
}

export { lineWriter };
export type { lineWriterConfig };
