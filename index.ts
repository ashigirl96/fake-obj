import * as ts from "typescript";
import {Project, Type } from "ts-morph";
import * as process from "process";


const path = './examples/country.ts'

function generateFake(type: Type<ts.Type>) {
  if (type.isString()) {
    return "fuga"
  }
  if (type.isNumber()) {
    return 10
  }
  if (type.isBoolean()) {
    return true
  }
}

function main6() {
  const project = new Project({})
  project.addSourceFileAtPath(path)
  const sourceFile = project.getSourceFile(path)
  if (!sourceFile)
    process.exit(1)
  const checker = project.getTypeChecker();
  const typeAlias = sourceFile.getTypeAliasOrThrow("Country")

  const visitType = (name: string, entryType: Type<ts.Type>, result: any) => {
    if (entryType.isNumber()) {
      result[name] = 10
    }
    if (entryType.isString()) {
      result[name] = "fuga"
    }
    if (entryType.isObject()) {
      for (const symbol of entryType.getProperties()) {
        const name = symbol.getName()
        const type = symbol.getTypeAtLocation(typeAlias)
        if (type.isArray()) {
          const elementType = checker.getTypeArguments(type)[0];
          result[name] = [
            generateFake(elementType),
            generateFake(elementType),
            generateFake(elementType),
          ]
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
    }
    return result
  }

  const result = visitType("Country", typeAlias.getType(), {})
  console.log(JSON.stringify(result, null, 2))
}

main6()