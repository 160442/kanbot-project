import { Box } from '@mui/material'

type Props = {
  height?: number
  maxWidth?: number
}

/** Full brand logo (robot + wordmark) */
export default function KanbotLogo({ height = 36, maxWidth }: Props) {
  return (
    <Box
      component="img"
      src="/kanbot-logo.png"
      alt="Kanbot"
      sx={{
        height,
        width: 'auto',
        maxWidth: maxWidth ?? height * 4.5,
        objectFit: 'contain',
        objectPosition: 'left center',
        display: 'block',
        flexShrink: 0,
        userSelect: 'none',
      }}
    />
  )
}
