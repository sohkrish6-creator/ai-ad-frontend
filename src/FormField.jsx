import { lbl, inp } from './ds'

/**
 * FormField — label + input/select/textarea in a consistent wrapper.
 * Standardizes label positioning (always above), input height, spacing.
 *
 * Usage:
 *   <FormField label="Website URL">
 *     <input type="url" value={url} onChange={...} style={inp} placeholder="https://..." />
 *   </FormField>
 *
 *   <FormField label="Goal" mb={0}>
 *     <select value={goal} onChange={...} style={inp}>...</select>
 *   </FormField>
 */
export default function FormField({ label, children, mb = 16, hint, style = {} }) {
  return (
    <div style={{ marginBottom: `${mb}px`, ...style }}>
      {label && <label style={lbl}>{label}</label>}
      {children}
      {hint && <p style={{ color: '#8A8A92', fontSize: '11px', marginTop: '5px', fontStyle: 'italic' }}>{hint}</p>}
    </div>
  )
}
