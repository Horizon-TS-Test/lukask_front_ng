import { SERV_IP } from "../servers/servers";

export const REST_SERV = {
    loginUrl: SERV_IP.middleware + '/login',
    pubsUrl: SERV_IP.middleware + '/publication',
    pubFilterUrl: SERV_IP.middleware + '/publication/filter',
    qTypeUrl: SERV_IP.middleware + '/qtype',
    commentUrl: SERV_IP.middleware + '/comment',
    relevanceUrl: SERV_IP.middleware + '/relevance',
    mediaBack: SERV_IP.middleware,
    pushSub: SERV_IP.push + '/subscribe',
    socketServerUrl: SERV_IP.middleware,
    webRtcSocketServerUrl: SERV_IP.kurentoClient + '/lukaskstreaming',
    userUrl: SERV_IP.middleware + '/user',
    notifUrl: SERV_IP.middleware + '/notification',
    paymentPay: SERV_IP.middleware + '/payment/pay',
    paymentCard: SERV_IP.middleware + '/payment/card',
    cancelado: SERV_IP.middleware + '/payment/cancelado',
    exitoso: SERV_IP.middleware + '/payment/exitoso',
    signUrl: SERV_IP.middleware + '/signIn',
    provinceUrl: SERV_IP.middleware + '/province',
    cantonUrl: SERV_IP.middleware + '/canton',
    parroquiaUrl: SERV_IP.middleware + '/parroquia',
    mediaRecorder : SERV_IP.middleware + '/media'
}