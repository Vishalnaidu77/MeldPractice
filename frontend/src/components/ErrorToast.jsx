export default function ErrorToast({ message, onDismiss }) {
  if (!message) return null
  return <div className="toast-error" role="alert"><span>!</span>{message}<button onClick={onDismiss} aria-label="Dismiss error">×</button></div>
}
