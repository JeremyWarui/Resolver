const NavButton = ({
    icon: Icon,
    label,
    isActive,
    onClick,
  }: {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${
        isActive
          ? 'text-[#0078d4] bg-[#e5f2fc] border-l-4 border-[#0078d4] border-b border-b-blue-200'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className='mr-3 h-5 w-5' />
      {label}
    </button>
  );
  
  export default NavButton;
  