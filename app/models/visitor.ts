import { VisitorSchema } from '#database/schema'

export default class Visitor extends VisitorSchema {
  get isInside() {
    return !this.exitedAt
  }
}
