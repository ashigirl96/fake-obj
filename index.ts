import * as ts from "typescript";
import {Project, Type } from "ts-morph";
import * as process from "process";


const path = './examples/country.ts'

function main6() {
  const project = new Project({})
  project.addSourceFileAtPath(path)
  const sourceFile = project.getSourceFile(path)
  if (!sourceFile)
    process.exit(1)
  const checker = project.getTypeChecker();
  const typeAlias = sourceFile.getTypeAliasOrThrow("Country")

  const visitType = (name: string, entryType: Type<ts.Type>, result: any) => {
    for (const symbol of entryType.getProperties()) {
      const name = symbol.getName()
      const type = symbol.getTypeAtLocation(typeAlias)
      if (type.isArray()) {
        continue
      }
      if (type.isNumber()) {
        result[name] = 10
        continue
      }
      if (type.isString()) {
        result[name] = "fuga"
        continue
      }
      if (type.isObject()) {
        result[name] = visitType(name, type, {})
      }
    }
    return result
  }

  const result = visitType("Country", typeAlias.getType(), {})
  console.log(JSON.stringify(result, null, 2))
}

main6()