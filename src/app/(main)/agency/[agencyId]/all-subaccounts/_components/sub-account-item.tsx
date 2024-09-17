'use client'

import React from 'react'
import { SubAccount } from '@prisma/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import DeleteButton from './delete-button'

const SubAccountItem: React.FC<{ subaccount: SubAccount }> = ({ subaccount }) => {
  return (
    <AlertDialog>
      <div className="h-32 !bg-background my-2 text-primary border-[1px] border-border p-4 rounded-lg hover:!bg-background cursor-pointer transition-all">
        <div className="flex gap-4 w-full h-full">
          <Link href={`/subaccount/${subaccount.id}`} className="flex gap-4 flex-grow">
            <div className="relative w-32">
              {/* <Image
                src={subaccount.subAccountLogo}
                alt="subaccount logo"
                fill
                className="rounded-md object-contain bg-muted/50 p-4"
              /> */}
            </div>
            <div className="flex flex-col justify-between">
              <div className="flex flex-col">
                {subaccount.name}
                <span className="text-muted-foreground text-xs">
                  {subaccount.address}
                </span>
              </div>
            </div>
          </Link>
          <AlertDialogTrigger asChild>
            <Button
              size={'sm'}
              variant={'destructive'}
              className="w-20 hover:bg-red-600 hover:text-white !text-white"
            >
              Delete
            </Button>
          </AlertDialogTrigger>
        </div>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              This action cannot be undone. This will delete the
              subaccount and all data related to the subaccount.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center">
            <AlertDialogCancel className="mb-2">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive">
              <DeleteButton subaccountId={subaccount.id} />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
  )
}

export default SubAccountItem