import * as ts from "typescript";
import {Project, Type, TypeAliasDeclaration, TypeChecker} from "ts-morph";
import * as process from "process";
import {faker} from "@faker-js/faker";
import {sample} from "lodash-es";
import yargs from "yargs";

// FIXME: dont use any
function generateFake(type: Type<ts.Type>, entryType: TypeAliasDeclaration, checker: TypeChecker): any {
  if (type.isStringLiteral()) {
    return type.getLiteralValue()
  }
  if (type.isString()) {
    return faker.datatype.uuid()
  }
  if (type.isNumber()) {
    return faker.datatype.number()
  }
  if (type.isBoolean()) {
    return faker.datatype.boolean()
  }
  if (type.isUnion()) {
    const type_ = sample(type.getUnionTypes())!
    return generateFake(type_, entryType, checker)
  }
  if (type.isArray()) {
    const elementType = checker.getTypeArguments(type)[0];
    return Array.from({length: 2}).map(() => generateFake(elementType, entryType, checker))
  }
  if (type.isObject()) {
    // FIXME: dont use any
    const result: any = {}
    for (const symbol of type.getProperties()) {
      const name = symbol.getName()
      result[name] = generateFake(symbol.getTypeAtLocation(entryType), entryType, checker)
    }
    return result
  }
  return undefined
}

function main() {
  const args = yargs(process.argv.slice(2))
    .usage('Usage: $0 <command> [options]')
    .option('path', {
      alias: 'p',
      description: 'file path',
      demandOption: true,
    })
    .option('type', {
      alias: 't',
      description: 'type name',
      demandOption: true,
    })
    .parseSync()
  const project = new Project({})
  project.addSourceFileAtPath(<string>args.path)
  const sourceFile = project.getSourceFile(<string>args.path)
  if (!sourceFile)
    process.exit(1)
  const checker = project.getTypeChecker();
  const typeAlias = sourceFile.getTypeAliasOrThrow(<string>args.type)

  const result = generateFake(typeAlias.getType(), typeAlias, checker)
  console.log(JSON.stringify(result, null, 2))
}

main()

