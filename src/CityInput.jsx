import { useId } from 'react'

// Top Indian cities for fast selection — free text is always allowed, this
// is just a shortcut list, never a constraint on what can be typed.
export const INDIA_CITIES = [
  'Jaipur', 'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Surat', 'Lucknow', 'Indore', 'Chandigarh', 'Kochi',
  'Goa', 'Nagpur', 'Bhopal', 'Patna', 'Vadodara', 'Coimbatore',
  'Visakhapatnam', 'Nashik', 'Ludhiana', 'Agra', 'Varanasi',
]

const LAST_CITY_KEY = 'adsoh_last_city'

export function getLastCity() {
  try {
    return localStorage.getItem(LAST_CITY_KEY) || ''
  } catch {
    return ''
  }
}

function saveLastCity(city) {
  try {
    if (city && city.trim()) localStorage.setItem(LAST_CITY_KEY, city.trim())
  } catch {
    // localStorage unavailable — last-city convenience just won't persist
  }
}

// Visible, editable convenience: last-used city pre-fills via getLastCity()
// in each page's useState initializer — never a silent hidden default.
export default function CityInput({ value, onChange, style, placeholder }) {
  const listId = useId()
  return (
    <>
      <input
        type="text"
        list={listId}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={e => saveLastCity(e.target.value)}
        placeholder={placeholder || 'City (optional — leave blank for all India)'}
        style={style}
      />
      <datalist id={listId}>
        {INDIA_CITIES.map(c => <option key={c} value={c} />)}
      </datalist>
    </>
  )
}
