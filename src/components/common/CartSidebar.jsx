import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { useCart } from "../../context/CartContext";
import { cn } from "../../utils/cn";

const CartSidebar = ({ isOpen, onClose }) => {
  const {
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    updateQuantity,
    removeItem,
  } = useCart();

  // Demo items if cart is empty
  const displayItems = items.length > 0 ? items : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" />
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {displayItems.length > 0 ? (
                <div className="space-y-4">
                  {displayItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                    >
                      <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                        <img
                          src={
                            item.image ||
                            "https://pngimg.com/uploads/pill/pill_PNG17239.png"
                          }
                          alt={item.name}
                          className="h-12 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {item.brand}
                        </p>
                        <p className="font-semibold text-primary mt-1">
                          ${item.price}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-red-500"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                          <button
                            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-l-lg dark:text-slate-300"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm font-medium dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-r-lg dark:text-slate-300"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag
                    size={64}
                    className="text-slate-200 dark:text-slate-600 mb-4"
                  />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Add medicines from the marketplace
                  </p>
                  <Link to="/marketplace" onClick={onClose}>
                    <Button>Browse Marketplace</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            {displayItems.length > 0 && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 dark:border-slate-600 dark:text-white">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                <Link to="/cart" onClick={onClose}>
                  <Button className="w-full gap-2 h-12">
                    Checkout <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
