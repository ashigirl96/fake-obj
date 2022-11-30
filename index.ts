import * as ts from "typescript";
import {Project, Type } from "ts-morph";
import * as process from "process";


const path = './examples/country.ts'

function main() {
  const project = new Project({})
  project.addSourceFileAtPath(path)
  const sourceFile = project.getSourceFile(path)
  if (!sourceFile)
    process.exit(1)
  const checker = project.getTypeChecker();
  const typeAlias = sourceFile.getTypeAliasOrThrow("Country")

  // FIXME: dont use any
  function generateFake(type: Type<ts.Type>): any {
    if (type.isString()) {
      return "fuga"
    }
    if (type.isNumber()) {
      return 10
    }
    if (type.isBoolean()) {
      return true
    }
    if (type.isArray()) {
      const elementType = checker.getTypeArguments(type)[0];
      return generateFakes(elementType, 3)
    }
    if (type.isObject()) {
      // FIXME: dont use any
      const result: any = {}
      for (const symbol of type.getProperties()) {
        const name = symbol.getName()
        result[name] = generateFake(symbol.getTypeAtLocation(typeAlias))
      }
      return result
    }
    return undefined
  }

  function generateFakes(type: Type<ts.Type>, length: number) {
    return Array.from({ length }).map(() => generateFake(type))
  }

  const visitType = (name: string, entryType: Type<ts.Type>, result: any) => {
    result[name]  = generateFake(entryType)
    return result
  }

  const result = visitType("Country", typeAlias.getType(), {})
  console.log(JSON.stringify(result, null, 2))
}

main()

