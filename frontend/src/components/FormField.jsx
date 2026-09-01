import { CheckIcon, AlertIcon, EyeIcon } from './Icons'

const STRENGTH_LABELS = { 1: 'Fair', 2: 'Good', 3: 'Strong' }

export default function FormField({
  values,
  errors,
  touched,
  showPw,
  onTogglePw,
  onChange,
  onBlur,
  passwordStrength,
  label,
  type,
  name,
  placeholder,
  extra = {},
  index = 0,
}) {
  const invalid = touched[name] && errors[name]
  const valid = touched[name] && !errors[name] && String(values[name] ?? '').length > 0
  const isPassword = extra.password
  const isDob = type === 'date'
  const delay = (0.22 + (index ?? 0) * 0.07).toFixed(2)
  const msgId = `${name}-help`
  const inputType = isPassword && showPw[name] ? 'text' : type

  let msg = null
  if (invalid) {
    msg = (
      <span className="msg-line error">
        <AlertIcon />
        {errors[name]}
      </span>
    )
  } else if (name === 'password' && touched.password && values.password) {
    const score = passwordStrength(values.password)
    msg = (
      <span className="msg-line strength">
        <span className="strength-bars" data-level={score}>
          <i></i>
          <i></i>
          <i></i>
        </span>
        <span className="strength-label">{STRENGTH_LABELS[score]}</span>
      </span>
    )
  } else if (
    name === 'confirmPassword' &&
    touched.confirmPassword &&
    values.confirmPassword &&
    values.confirmPassword === values.password
  ) {
    msg = (
      <span className="msg-line ok">
        <CheckIcon />
        Passwords match
      </span>
    )
  } else if (valid && !isPassword && !isDob) {
    msg = (
      <span className="msg-line ok">
        <CheckIcon />
        Looks good
      </span>
    )
  }

  return (
    <div className="field" style={{ animationDelay: `${delay}s` }}>
      <label htmlFor={name}>{label}</label>
      <div className="control">
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={values[name] ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          className={
            (invalid ? ' invalid' : '') +
            (isPassword ? ' has-toggle' : '') +
            (((valid && !isPassword && !isDob) || (invalid && !isDob)) ? ' has-status' : '')
          }
          aria-invalid={invalid || undefined}
          aria-describedby={invalid || msg ? msgId : undefined}
        />
        {valid && !isPassword && !isDob && (
          <span className="status-icon valid" aria-hidden="true">
            <CheckIcon />
          </span>
        )}
        {invalid && !isPassword && !isDob && (
          <span className="status-icon bad" aria-hidden="true">
            <AlertIcon />
          </span>
        )}
        {isPassword && (
          <button
            type="button"
            className="pw-toggle"
            onClick={() => onTogglePw(name)}
            aria-label={showPw[name] ? 'Hide password' : 'Show password'}
            aria-pressed={showPw[name]}
          >
            <EyeIcon open={showPw[name]} />
          </button>
        )}
      </div>
      <div className={msg ? 'msg open' : 'msg'} id={msgId} aria-live="polite">
        {msg && <span>{msg}</span>}
      </div>
    </div>
  )
}
