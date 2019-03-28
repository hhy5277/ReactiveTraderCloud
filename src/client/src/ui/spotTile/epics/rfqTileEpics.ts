import { Action } from 'redux'
import { ofType } from 'redux-observable'
import { delay, map, takeUntil, mergeMap } from 'rxjs/operators'
import { ApplicationEpic } from 'StoreTypes'
import { TILE_ACTION_TYPES, SpotTileActions } from '../actions'
import { of, timer } from 'rxjs'
import { RfqRequest } from '../model/rfqRequest'

const { rfqRequest, rfqReceived, rfqExpired, rfqCancel } = SpotTileActions

type RfqRequestActionType = ReturnType<typeof rfqRequest>
type RfqReceivedActionType = ReturnType<typeof rfqReceived>
// type RfqExpiredActionType = ReturnType<typeof rfqExpired>
type RfqCancelActionType = ReturnType<typeof rfqCancel>

const fakeAjaxCall = (r: RfqRequest) =>
  of({
    notional: r.notional,
    currencyPair: r.currencyPair,
    price: Math.random() * (3 - 0),
    timeout: 60000,
  }).pipe(delay(Math.random() * (10000 - 0)))

const fetchRfqQuote = (payload: RfqRequest) => ({
  type: TILE_ACTION_TYPES.RFQ_RECEIVED,
  payload,
})

export const rfqRequestEpic: ApplicationEpic = action$ =>
  action$.pipe(
    ofType<Action, RfqRequestActionType>(TILE_ACTION_TYPES.RFQ_REQUEST),
    mergeMap(action =>
      fakeAjaxCall(action.payload).pipe(
        map(response => fetchRfqQuote(response)),
        takeUntil(action$.pipe(ofType<Action, RfqCancelActionType>(TILE_ACTION_TYPES.RFQ_CANCEL))),
      ),
    ),
  )

export const rfqReceivedEpic: ApplicationEpic = action$ =>
  action$.pipe(
    ofType<Action, RfqReceivedActionType>(TILE_ACTION_TYPES.RFQ_RECEIVED),
    mergeMap(action => {
      const cancel$ = action$.pipe(
        ofType<any>(TILE_ACTION_TYPES.RFQ_REJECT, TILE_ACTION_TYPES.RFQ_EXPIRED),
        // filter(
        //   (rejectAction: RfqExpiredActionType | RfqCancelActionType) =>
        //     rejectAction.payload.currencyPair === action.payload.currencyPair,
        // ),
      )

      return timer(action.payload.timeout).pipe(
        takeUntil(cancel$),
        map(() => rfqExpired({ currencyPair: action.payload.currencyPair })),
      )
    }),
  )
