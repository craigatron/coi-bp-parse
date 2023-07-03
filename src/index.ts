import { ungzip } from "pako";

export class ParseError extends Error {
  message: string;
  cause?: any;

  constructor({ message, cause }: { message: string; cause?: any }) {
    super();
    this.message = message;
    this.cause = cause;
  }
}

export interface ParsedComponentValues {
  integers: { [key: string]: number };
  strings: { [key: string]: string };
  booleans: { [key: string]: boolean };
  stringLists: { [key: string]: string[] };
  byteArrays: { [key: string]: Uint8Array };
}

export interface Blueprint {
  libraryVersion: number;
  gameVersion: string;
  saveVersion: number;
  name: string;
  description?: string;
  componentCounts: { [key: string]: number };
  rawItems: ParsedComponentValues[];
}

class Stream {
  index: number;
  array: Uint8Array;
  memoized: any[];

  constructor(array: Uint8Array) {
    this.index = 0;
    this.memoized = [null];
    this.array = array;
  }

  readByte = (): number => {
    if (this.index > this.array.length) {
      throw new ParseError({ message: "stream is exhausted" });
    }
    return this.array[this.index++];
  };

  readBytes = (numBytes: number): Uint8Array => {
    const startIndex = this.index;
    this.index += numBytes;
    if (this.index > this.array.length) {
      throw new ParseError({ message: "stream is exhausted" });
    }
    return this.array.slice(startIndex, this.index);
  };

  readUInt = (): number => {
    let num = this.readByte();
    let uint = num & 127;
    if ((num & 128) === 0) {
      return uint;
    }
    num = this.readByte();
    uint |= (num & 127) << 7;
    if ((num & 128) === 0) {
      return uint;
    }
    num = this.readByte();
    uint |= (num & 127) << 14;
    if ((num & 128) === 0) {
      return uint;
    }
    throw new ParseError({ message: "number too big" });
  };

  readInt = (): number => {
    const val = this.readUInt();
    return (val >> 1) ^ -(val & 1);
  };

  readNonNegativeInt = (): number => {
    const num = this.readUInt();
    if (num < 0) {
      throw new ParseError({ message: "expected non-negative integer" });
    }
    return num;
  };

  readBoolean = (): boolean => {
    return this.readByte() !== 0;
  };

  readString = (): string => {
    const id = this.readNonNegativeInt();
    if (this.memoized[id]) {
      return this.memoized[id] as string;
    }

    const val = this.readCSharpString();
    this.memoized[id] = val;
    return val;
  };

  private read7BitInt = (): number => {
    let num = 0;
    let shift = 0;
    while (shift != 35) {
      const byte = this.readByte();
      num |= (byte & 127) << (shift & 31);
      shift += 7;
      if ((byte & 128) === 0) {
        return num;
      }
    }
    throw new ParseError({ message: "Invalid 7-bit integer" });
  };

  private readCSharpString = (): string => {
    const length = this.read7BitInt();
    if (length === 0) {
      return "";
    }

    return new TextDecoder().decode(this.readBytes(length));
  };
}

export const parseBlueprint = (bp: string): Blueprint => {
  if (bp.length <= 4) {
    throw new ParseError({ message: "Blueprint string too short" });
  }
  const header = bp[0];
  if (header !== "B") {
    throw new ParseError({ message: "Unexpected header" });
  }
  const split = bp.split(":");
  if (split.length !== 2) {
    throw new ParseError({ message: "Invalid blueprint string" });
  }
  const checksum = Number.parseInt(split[0].substring(1), 10);
  if (Number.isNaN(checksum)) {
    throw new ParseError({ message: "Invalid checksum" });
  }

  if (checksum !== split[1].length) {
    throw new ParseError({
      message: `Failed checksum: expected ${checksum}, actual ${split[1].length}`,
    });
  }

  let ungzipped: Uint8Array;
  try {
    const base64decoded = atob(split[1]);
    ungzipped = ungzip(Uint8Array.from(base64decoded, (c) => c.charCodeAt(0)));
  } catch (ex) {
    throw new ParseError({
      message: "Could not decode blueprint string",
      cause: ex,
    });
  }

  const stream = new Stream(ungzipped);

  const libraryVersion = stream.readNonNegativeInt();
  if (libraryVersion !== 1) {
    throw new ParseError({
      message: `Unsupported library version: ${ungzipped[0]}`,
    });
  }

  const gameVersion = stream.readString();
  const saveVersion = stream.readNonNegativeInt();
  const name = stream.readString();
  const description = stream.readString();
  const length = stream.readNonNegativeInt();

  const componentCounts: { [key: string]: number } = {};
  const rawItems = [];
  for (let i = 0; i < length; i++) {
    const entity = parseEntity(stream);
    rawItems.push(entity);
    const componentName = entity.strings["Prototype"];
    if (componentName) {
      const count = (componentCounts[componentName] || 0) + 1;
      componentCounts[componentName] = count;
    }
  }

  return {
    libraryVersion,
    gameVersion,
    saveVersion,
    name,
    description,
    componentCounts,
    rawItems,
  };
};

const readDict = <T>(
  stream: Stream,
  readValue: () => T
): { [key: string]: T } => {
  const numValues = stream.readNonNegativeInt();
  const dict: { [key: string]: T } = {};
  for (let i = 0; i < numValues; i++) {
    const key = stream.readString();
    dict[key] = readValue();
  }
  return dict;
};

const parseEntity = (stream: Stream): ParsedComponentValues => {
  const integers = readDict(stream, () => {
    return stream.readInt();
  });
  const booleans = readDict(stream, () => {
    return stream.readBoolean();
  });
  const strings = readDict(stream, () => {
    return stream.readString();
  });
  const stringLists = readDict(stream, () => {
    const strings: string[] = [];
    const numStrings = stream.readNonNegativeInt();
    for (let i = 0; i < numStrings; i++) {
      strings.push(stream.readString());
    }
    return strings;
  });
  const byteArrays = readDict(stream, () => {
    const numBytes = stream.readNonNegativeInt();
    return stream.readBytes(numBytes);
  });
  return {
    integers,
    strings,
    booleans,
    stringLists,
    byteArrays,
  };
};
