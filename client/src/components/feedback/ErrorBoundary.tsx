import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, Button, Typography } from '@mui/material'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <Box sx={{ p: 4, textAlign: 'center', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Something went wrong</Typography>
          <Typography color="text.secondary" sx={{ mb: 2, fontFamily: 'monospace', fontSize: 13 }}>
            {this.state.error.message}
          </Typography>
          <Button variant="contained" onClick={() => this.setState({ error: null })}>
            Try again
          </Button>
        </Box>
      )
    }
    return this.props.children
  }
}
