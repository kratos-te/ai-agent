export const toJSON = (str: string): any => {
  try {
    // Remove curly braces and split by comma
    const pairs = str.trim().slice(1, -1).split(",");

    // Convert to object with explicit type
    const obj: Record<string, any> = {};

    pairs.forEach((pair) => {
      const [key, value] = pair
        .trim()
        .split(":")
        .map((s) => s.trim());

      if (!key || value === undefined) {
        throw new Error("Invalid key-value pair format");
      }

      obj[key] = isNaN(Number(value)) ? value : Number(value);
    });

    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    throw new Error(`Failed to parse string to JSON: ${error}`);
  }
};
