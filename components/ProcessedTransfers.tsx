export default function ProcessedTransfers ({
  transfers
}: Readonly<{
  transfers: any[]
}>) {
  return (
    <div style={{ width: '50%' }}>
      <h2>Processed Transfers</h2>
      <div>
        {transfers.map((transfer, i) => (
          <div key={i}>
            <div>{transfer.amount}</div>
            <div>{transfer.to}</div>
            <div>{transfer.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
