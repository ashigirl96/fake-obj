type Country = {
  Jp: Human,
  En: Human,
}

type Human = {
  name: Name,
  age: number[]
}

type Name = {
  first: string
  last: string
}
