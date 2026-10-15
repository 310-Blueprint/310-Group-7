import pipelineLogo from '../../assets/pipelinelogo.png'

/* Pipeline wordmark with the shared beaver icon. */
function Logo({ className = '', markClassName = 'size-7' }) {
  return (
    <span className={`flex items-center gap-2 font-bold ${className}`}>
      <img
        src={pipelineLogo}
        alt=""
        aria-hidden="true"
        className={`shrink-0 rounded-full object-contain ${markClassName}`}
      />
      Pipeline
    </span>
  )
}

export default Logo
