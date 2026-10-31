import { City, State } from 'country-state-city'

export const INDIAN_STATES = State.getStatesOfCountry('IN').map((item) => item.name).sort()
const statesByCode = new Map(State.getStatesOfCountry('IN').map((item) => [item.isoCode, item.name]))
const citiesByState = new Map<string, string[]>()
for (const city of City.getCitiesOfCountry('IN') || []) {
  const stateName = statesByCode.get(city.stateCode)
  if (!stateName) continue
  const cities = citiesByState.get(stateName) || []
  cities.push(city.name)
  citiesByState.set(stateName, cities)
}
export const INDIAN_CITIES: Record<string, string[]> = Object.fromEntries(
  [...citiesByState.entries()].map(([state, cities]) => [state, [...new Set(cities)].sort()]),
)
