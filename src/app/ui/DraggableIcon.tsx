export default function DraggableIcon({
  height = 27,
  width = 9,
  fill = '#CCCCCC',
  isDisabled = false,
  className = '',
}) {
  return (
    <svg
      width={width}
      height={height}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      viewBox='0 0 9 27'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <circle cx='1.5' cy='1.5' r='1.5' fill={fill} />
      <circle cx='1.5' cy='7.5' r='1.5' fill={fill} />
      <circle cx='1.5' cy='13.5' r='1.5' fill={fill} />
      <circle cx='1.5' cy='19.5' r='1.5' fill={fill} />
      <circle cx='1.5' cy='25.5' r='1.5' fill={fill} />
      <circle cx='7.5' cy='1.5' r='1.5' fill={fill} />
      <circle cx='7.5' cy='7.5' r='1.5' fill={fill} />
      <circle cx='7.5' cy='13.5' r='1.5' fill={fill} />
      <circle cx='7.5' cy='19.5' r='1.5' fill={fill} />
      <circle cx='7.5' cy='25.5' r='1.5' fill={fill} />
    </svg>
  );
}
