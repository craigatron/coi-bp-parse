import { parseBlueprint, ParseError } from "../src/index";

describe("blueprint parser", () => {
  it("should throw on a string that is too short", () => {
    expect(() => {
      parseBlueprint("");
    }).toThrow(ParseError);
  });

  it("should throw on a string without the right initial character", () => {
    expect(() => {
      parseBlueprint(
        "F292:H4sIAAAAAAAACkWNwU7CQBRFZ4ZpsRWs4MK9cU1MjD8gEkMigYA/8Jw+y0vLvObNNIH489YFsrzn5p6rdfo0e5k9ux9jHUMzUMba27VQRR6ahY8UT8vyIZl+cEUhkgtL33ZxxSWq9O4frrt4psPiHT0KNBshln4+Vfoq2whHjqcWs/F8D/J3tYIaRefDLTpqMejr4ty8duLJV3qUfQr48M1ySIxSRg3sY2JT2wvH+e7ANe4iuFrn5mZyiYvjHroQi/sLmoN8sX8jPlKJepSotJf9AsaxV1f7AAAA"
      );
    }).toThrow(ParseError);
  });

  it("should throw on a string missing the separator", () => {
    expect(() => {
      parseBlueprint(
        "B292H4sIAAAAAAAACkWNwU7CQBRFZ4ZpsRWs4MK9cU1MjD8gEkMigYA/8Jw+y0vLvObNNIH489YFsrzn5p6rdfo0e5k9ux9jHUMzUMba27VQRR6ahY8UT8vyIZl+cEUhkgtL33ZxxSWq9O4frrt4psPiHT0KNBshln4+Vfoq2whHjqcWs/F8D/J3tYIaRefDLTpqMejr4ty8duLJV3qUfQr48M1ySIxSRg3sY2JT2wvH+e7ANe4iuFrn5mZyiYvjHroQi/sLmoN8sX8jPlKJepSotJf9AsaxV1f7AAAA"
      );
    }).toThrow(ParseError);
  });

  it("should throw on an incorrect checksum", () => {
    expect(() => {
      parseBlueprint(
        "B290:H4sIAAAAAAAACkWNwU7CQBRFZ4ZpsRWs4MK9cU1MjD8gEkMigYA/8Jw+y0vLvObNNIH489YFsrzn5p6rdfo0e5k9ux9jHUMzUMba27VQRR6ahY8UT8vyIZl+cEUhkgtL33ZxxSWq9O4frrt4psPiHT0KNBshln4+Vfoq2whHjqcWs/F8D/J3tYIaRefDLTpqMejr4ty8duLJV3qUfQr48M1ySIxSRg3sY2JT2wvH+e7ANe4iuFrn5mZyiYvjHroQi/sLmoN8sX8jPlKJepSotJf9AsaxV1f7AAAA"
      );
    }).toThrow(ParseError);
  });

  it("should throw if the end of stream is not reached", () => {
    expect(() => {
      parseBlueprint(
        // parseable blueprint with an extra byte at the end
        "B296:H4sIAPm2pGQC/0WNwU7CQBRFZ4ZpsRWs4sK9cU1MjD8gNoZEAhF/YJw+y0vLvObNawLx560LZHnPzT1X6/Rx/jx/8j/GenLtSBlrr9eMNQbXlkFQjsvqPpm9U41R0Mdl6HpZUQUqvf2H615OdFy8QQB27YaReJjPlL7INkxCcuwgmy52jv+uVq4B1vn4Azx2EPVlcWpeeg4Yaj3JPtmF+E28T4xSRo3sQ2JTOwin+XZPDWzF+Ubn5urmHMvDzvVRirszWjj+ovCKdMAK9CRR6SArfwGmauSm/AAAAA=="
      );
    }).toThrow(ParseError);
  });

  it("should parse a valid blueprint", () => {
    const bp = parseBlueprint(
      "B292:H4sIAAAAAAAACkWNwU7CQBRFZ4ZpsRWs4MK9cU1MjD8gEkMigYA/8Jw+y0vLvObNNIH489YFsrzn5p6rdfo0e5k9ux9jHUMzUMba27VQRR6ahY8UT8vyIZl+cEUhkgtL33ZxxSWq9O4frrt4psPiHT0KNBshln4+Vfoq2whHjqcWs/F8D/J3tYIaRefDLTpqMejr4ty8duLJV3qUfQr48M1ySIxSRg3sY2JT2wvH+e7ANe4iuFrn5mZyiYvjHroQi/sLmoN8sX8jPlKJepSotJf9AsaxV1f7AAAA"
    );
    expect(bp.libraryVersion).toEqual(1);
    expect(bp.gameVersion).toEqual("0.5.3c");
    expect(bp.saveVersion).toEqual(123);
    expect(bp.name).toEqual("coal");
    expect(bp.description).toEqual("");
    expect(bp.componentCounts).toEqual({ CharcoalMaker: 1, SmokeStack: 1 });
  });
});
