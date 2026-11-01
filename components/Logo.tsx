import Image from 'next/image'

type LogoProps = {
  className?: string
  showText?: boolean
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  const lightSrc = showText ? '/navaudyog-logo-light.svg' : '/navaudyog-mark.svg'
  const darkSrc = showText ? '/navaudyog-logo-dark.svg' : '/navaudyog-mark-dark.svg'
  const imageWidth = showText ? 150 : 46
  const imageHeight = showText ? 35 : 32
  const alt = showText ? 'Nava Udyog' : 'Nava Udyog mark'

  return (
    <span className={`site-logo${showText ? '' : ' site-logo-mark'} ${className}`}>
      <Image className="logo-light" src={lightSrc} width={imageWidth} height={imageHeight} alt={alt} />
      <Image className="logo-dark" src={darkSrc} width={imageWidth} height={imageHeight} alt={alt} />
    </span>
  )
}
