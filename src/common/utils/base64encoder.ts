export function base64encoder(src: string) {
  return Buffer.from(src).toString('base64');
}
