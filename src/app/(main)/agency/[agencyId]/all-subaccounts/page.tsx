import { getAuthUserDetails } from '@/lib/queries'
import { SubAccount } from '@prisma/client'
import CreateSubaccountButton from './_components/create-subaccount-btn'
import SubAccountList from './_components/sub-account-list'

type Props = {
  params: { agencyId: string }
}

const AllSubaccountsPage = async ({ params }: Props) => {
  const user = await getAuthUserDetails()
  if (!user) return null

  return (
    <div className="flex flex-col">
      <CreateSubaccountButton
        user={user}
        id={params.agencyId}
        className="w-[200px] self-end m-6"
      />
      <SubAccountList subAccounts={user.Agency?.SubAccount || []} />
    </div>
  )
}

export default AllSubaccountsPage