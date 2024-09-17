'use client'

import React, { useState } from 'react'
import { SubAccount } from '@prisma/client'
import { Input } from '@/components/ui/input'
import SubAccountItem from './sub-account-item'

const SubAccountList: React.FC<{ subAccounts: SubAccount[] }> = ({ subAccounts }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSubAccounts = subAccounts.filter((subaccount) =>
    subaccount.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="rounded-lg bg-transparent">
      <Input
        placeholder="Search Account..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="space-y-2">
        {filteredSubAccounts.length === 0 ? (
          <div className="text-muted-foreground text-center p-4">
            No Results Found.
          </div>
        ) : (
          filteredSubAccounts.map((subaccount) => (
            <SubAccountItem key={subaccount.id} subaccount={subaccount} />
          ))
        )}
        {subAccounts.length === 0 && (
          <div className="text-muted-foreground text-center p-4">
            No Sub accounts
          </div>
        )}
      </div>
    </div>
  )
}

export default SubAccountList