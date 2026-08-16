import ShopPanel from './ShopPlanel'

export default function ShopDialog({ shopFollowers, shopItems, onBuyItem, onBuyFollower, onClose, loading }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="dialog shop-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="โรงเบิกสิ่งของและผู้ติดตาม"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" type="button" aria-label="ปิดโรงเบิกหลวง" onClick={onClose}>×</button>
        {loading ? (
          <div className="shop-loading" role="status">กำลังเปิดบัญชีสิ่งของ...</div>
        ) : (
          <ShopPanel
            shopFollowers={shopFollowers}
            shopItems={shopItems}
            onBuyItem={onBuyItem}
            onBuyFollower={onBuyFollower}
          />
        )}
      </section>
    </div>
  )
}
