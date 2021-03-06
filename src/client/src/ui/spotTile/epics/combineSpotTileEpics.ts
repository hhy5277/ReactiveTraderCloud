import { combineEpics } from 'redux-observable'
import { closePositionEpic } from './closePosition'
import { displayCurrencyChartEpic } from './currencyChartEpic'
import { pricingServiceEpic, pricingHistoryEpic } from './pricingEpics'
import { publishPriceUpdateEpic } from './publishPrice'
import { spotTileEpic } from './spotTileEpics'
import { publishTradeExecutedEpic } from './tradeExecutedEpic'
import { ApplicationDependencies } from 'applicationServices'

export default ({ platform }: ApplicationDependencies) => {
  const epics = [spotTileEpic, pricingServiceEpic, pricingHistoryEpic]

  if (platform.hasFeature('excel')) {
    epics.push(publishPriceUpdateEpic, publishTradeExecutedEpic, closePositionEpic)
  }

  if (platform.hasFeature('chartIQ')) {
    epics.push(displayCurrencyChartEpic)
  }

  return combineEpics(...epics)
}
