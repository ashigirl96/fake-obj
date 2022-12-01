type Country = {
  Jp: {
    human: Human[]
  }
}

type Human = {
  name: Name,
  age: Age
  dead: boolean
  sex: "male" | "female" | "other"
}

type Name = {
  first: string
  last: string
}

type Age = number
