type Country = {
  Jp: Human[],
  En: {
    human: Human,
  },
}

type Human = {
  name: Name,
  age: Age
}

type Name = {
  first: string
  last: string
}

type Age = number
