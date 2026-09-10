export const DPO_TEST_AMOUNT = 10;
export const DPO_TEST_PRODUCT_CODE = "DPO-TEST";
export const DPO_TEST_PRODUCT_NAME = "DPO Test";

export function isDpoTestCode(code: string) {
  return code === DPO_TEST_PRODUCT_CODE;
}

export function cartIsDpoTestOnly(lines: { code: string }[]) {
  return lines.length > 0 && lines.every((line) => isDpoTestCode(line.code));
}

export function cartHasDpoTest(lines: { code: string }[]) {
  return lines.some((line) => isDpoTestCode(line.code));
}
