import { Box, styled, Text } from '@ignite-ui/react'

export const ConnectBox = styled(Box, {
  marginTop: '$6',
  display: 'flex',
  flexDirection: 'column',
})

export const ConnectItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '$4 $6',
  border: '1px solid $gray600',
  borderRadius: '$md',

  marginBottom: '$2',
})

export const AuthError = styled(Text, {
  color: '#f75a68',
  marginBottom: '$2',
})
