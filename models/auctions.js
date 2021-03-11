const firestore = require('../utils/firestore')
const auctionsModel = firestore.collection('auctions')
const bidsModel = firestore.collection('bids')

const fetchAuctionById = async (auctionId) => {
  try {
    const auctionRef = await auctionsModel.doc(auctionId).get()
    const auctionMetadata = auctionRef.data()
    const biddersAndBidsRef = await bidsModel.where('auctionId', '==', auctionId).get()
    const biddersAndBids = []
    biddersAndBidsRef.forEach((bidData) => {
      biddersAndBids.push(bidData.data())
    })
    return { ...auctionMetadata, biddersAndBids }
  } catch (error) {
    logger.error(`Error fetching auction ${auctionId}: ${error}`)
    throw error
  }
}

const fetchAuctionBySeller = async (sellerId) => {
  try {
    const auctionsRef = await auctionsModel.where('seller', '==', sellerId).get()
    const auctions = []

    auctionsRef.forEach((auction) => {
      auctions.push({
        id: auction.id,
        ...auction.data()
      })
    })

    return auctions
  } catch (error) {
    logger.error(`Error fetching auction: ${error}`)
    throw error
  }
}

const fetchAvailableAuctions = async () => {
  try {
    const now = new Date().getTime()
    const auctionsRef = await auctionsModel.where('endTime', '>=', now).get()
    const auctions = []

    auctionsRef.forEach((auction) => {
      auctions.push({
        id: auction.id,
        ...auction.data()
      })
    })

    return auctions
  } catch (error) {
    logger.error(`Error fetching auction: ${error}`)
    throw error
  }
}

const fetchAuctionsInRange = async (startTime, endTime = null) => {
  let auctionsRef
  try {
    if (endTime) {
      auctionsRef = await auctionsModel.where('startTime', '>=', startTime).where('endTime', '<=', endTime).get()
    } else {
      auctionsRef = await auctionsModel.where('startTime', '>=', startTime).get()
    }
    const auctions = []
    auctionsRef.forEach((auction) => {
      auctions.push({
        id: auction.id,
        ...auction.data
      })
    })
    return auctions
  } catch (error) {
    logger.error(`Error fetching auction: ${error}`)
    throw error
  }
}

const createNewAuction = async ({ seller, initialPrice, item, duration, quantity }) => {
  try {
    const now = new Date().getTime()

    const auctionRef = await auctionsModel.add({
      seller: seller,
      item: item,
      quantity: quantity,
      highest_bidder: null,
      highest_bid: initialPrice,
      number_bidders: 0,
      startTime: now,
      endTime: now + duration
    })

    logger.info(`Created new auction ${auctionRef.id}`)
    return auctionRef.id
  } catch (error) {
    logger.error(`Error creating new auction: ${error}`)
    throw error
  }
}

const makeNewBid = async ({ bidderId, auctionId, bid }) => {
  try {
    const bidRef = await bidsModel.add({
      auctionId: auctionId,
      bidderId: bidderId,
      bid: bid,
      time: new Date().getTime()
    })

    logger.info(`Made new bid ${bidRef.id}`)
    return bidRef.id
  } catch (error) {
    logger.error(`Error making bid: ${error}`)
    throw error
  }
}

module.exports = {
  fetchAuctionById,
  fetchAuctionBySeller,
  fetchAvailableAuctions,
  fetchAuctionsInRange,

  createNewAuction,

  makeNewBid
}
