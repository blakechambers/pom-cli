interface lineWriterConfig {
  (text: string): Promise<void>;
}

function bufferToLength(text: string, i: number): string {
  const buffer = text.length < i ? " ".repeat(i - text.length) : "";

  return text + buffer;
}

class LineWriter {
  private lastLine = "";

  write = async (text: string): Promise<void> => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(
      `\r${bufferToLength(text, this.lastLine.length)}`,
    );
    // write to stdout in Deno 2
    await Deno.stdout.write(bytes); // :contentReference[oaicite:0]{index=0}
    this.lastLine = text;
  };
}

export { LineWriter };
export type { lineWriterConfig };
