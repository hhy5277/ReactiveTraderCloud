import { CurrencyPair, Direction, ServiceConnectionStatus } from 'rt-types'
import { SpotTileData } from '../model'
import { ValidationMessage, NotionalUpdate } from './notional/NotionalInput'
import { RfqRequest } from '../model/rfqRequest'

export interface TradingMode {
  symbol: CurrencyPair['symbol']
  mode: 'esp' | 'rfq'
}

export type RfqState = 'none' | 'canRequest' | 'requested' | 'received' | 'expired'

export interface RfqActions {
  request: (requestObj: RfqRequest) => void
  cancel: () => void
  requote: (requestObj: RfqRequest) => void
}

export interface TileSwitchChildrenProps {
  notional: string
  userError: boolean
  rfqState: RfqState
}

export interface Props {
  currencyPair: CurrencyPair
  spotTileData: SpotTileData
  executionStatus: ServiceConnectionStatus
  executeTrade: (direction: Direction, rawSpotRate: number) => void
  notional: string
  updateNotional: (notionalUpdate: NotionalUpdate) => void
  inputDisabled: boolean
  inputValidationMessage: ValidationMessage
  tradingDisabled: boolean
  chartData?: []
}
