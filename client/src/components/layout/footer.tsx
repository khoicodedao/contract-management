import React from "react";

export default function Footer() {
  return (
    <div className="w-full bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-center items-center">
      <div className="flex flex-col sm:flex-row items-end space-y-2 sm:space-y-0 sm:space-x-4 text-center">
        {/* Developer Info */}
        <div className="flex items-center items-end space-x-3">
          <img
            src="https://avatars.githubusercontent.com/u/583231?v=4"
            alt="Developer Avatar"
            className="w-8 h-8 rounded-full"
          />
          <div className="text-xs text-slate-500 text-left">
            <p>Developed by</p>
            <p className="text-slate-700 font-medium">Tran Ngoc Tuan</p>
          </div>
        </div>

        {/* Company Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Powered by</span>
          <img
            src="https://images.unsplash.com/photo-1584441405886-bc91be61e56a?q=80&w=1030&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Yamaha Logo"
            className="w-10 h-10 object-contain"
          />
        </div>
      </div>
    </div>
  );
}
