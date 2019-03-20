import numeral from 'numeral'
import { convertNotionalShorthandToNumericValue } from './notional/utils'
import { ServiceConnectionStatus } from 'rt-types'
import { TileProps, TileState } from './Tile'
import { NotionalUpdate } from './notional/NotionalInput'

export const NUMERAL_FORMAT = '0,000,000[.]00'
const DEFAULT_NOTIONAL_VALUE = 1000000
const MAX_NOTIONAL_VALUE = 1000000000
const MIN_RFQ_VALUE = 10000000
const RESET_NOTIONAL_VALUE = DEFAULT_NOTIONAL_VALUE

export const getDefaultNotionalValue = () => numeral(DEFAULT_NOTIONAL_VALUE).format(NUMERAL_FORMAT)

export const getNotional = (notional: string) => numeral(notional).value() || DEFAULT_NOTIONAL_VALUE

export const isInvalidTradingValue = (value: string) =>
  value === '.' ||
  value === '0' ||
  value === '.0' ||
  value === '0.' ||
  value === '0.0' ||
  value === '' ||
  value === 'Infinity' ||
  value === 'NaN'

export const getDerivedStateFromBusinessLogic = (nextProps: TileProps, prevState: TileState) => {
  const { spotTileData, executionStatus } = nextProps
  const { rfqState, tradingDisabled } = prevState
  const canExecute = Boolean(
    !tradingDisabled &&
      rfqState !== 'canRequest' &&
      executionStatus === ServiceConnectionStatus.CONNECTED &&
      !spotTileData.isTradeExecutionInFlight &&
      spotTileData.price,
  )
  return {
    ...prevState,
    canExecute,
  }
}

export const getStateFromBusinessLogic = (
  prevState: TileState,
  { value, type }: NotionalUpdate,
): TileState => {
  console.log(type, value)
  const numericValue = convertNotionalShorthandToNumericValue(value)

  if (type === 'blur' && isInvalidTradingValue(value)) {
    console.log('case 1')
    // onBlur if invalid trading value, reset value
    // remove any message, enable trading
    return {
      ...prevState,
      notional: numeral(RESET_NOTIONAL_VALUE).format(NUMERAL_FORMAT),
      inputValidationMessage: null,
      rfqState: 'none',
      tradingDisabled: false,
    }
  } else if (isInvalidTradingValue(value)) {
    console.log('case 2')
    // onChange if invalid trading value, update value
    // user may be trying to enter decimals or
    // user may be deleting previous entry (empty string)
    // in those cases, format and update only when completed (in other case).
    // remove any message, disable trading
    return {
      ...prevState,
      notional: value,
      inputValidationMessage: null,
      rfqState: 'none',
      tradingDisabled: true,
    }
  } else if (numericValue >= MIN_RFQ_VALUE && numericValue <= MAX_NOTIONAL_VALUE) {
    // if in RFQ range, set rfqState to 'canRequest' to trigger prompt
    // remove any message, disable trading
    console.log('case 3')
    return {
      ...prevState,
      notional: value,
      inputValidationMessage: null,
      rfqState: 'canRequest',
      tradingDisabled: true,
    }
  } else if (numericValue > MAX_NOTIONAL_VALUE) {
    // if value exceeds Max, show error message
    // update value, disable trading
    console.log('case 4')
    return {
      ...prevState,
      notional: value,
      inputValidationMessage: {
        type: 'error',
        content: 'Max exceeded',
      },
      rfqState: 'canRequest',
      tradingDisabled: true,
    }
  } else if (numericValue < MIN_RFQ_VALUE) {
    // if under RFQ range, back to ESP (rfqState: 'none')
    // update value, remove message, enable trading
    console.log('case 5')
    return {
      ...prevState,
      notional: value,
      inputValidationMessage: null,
      rfqState: 'none',
      tradingDisabled: false,
    }
  } else {
    // This case should not happen
    // Simply to prevent stuff from breaking
    console.log('case 6')
    return {
      ...prevState,
      notional: value,
      inputValidationMessage: null,
      tradingDisabled: false,
    }
  }
}
