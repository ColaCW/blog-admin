import isPlainObject from 'lodash/isPlainObject';

function getType(fn) {
  const match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : '';
}

export function isEmptyElement(c) {
  return !(c.tag || (c.text && c.text.trim() !== ''));
}

export function filterEmpty(children = []) {
  return children.filter(c => !isEmptyElement(c));
}

const filterProps = (props, propsData = {}) => {
  const res = {};
  Object.keys(props).forEach(k => {
    if (k in propsData || props[k] !== undefined) {
      res[k] = props[k];
    }
  });
  return res;
};

// 合并组件的 props 属性
const mergeProps = (...args) => {
  const props = {};
  args.forEach((p = {}) => {
    for (const [k, v] of Object.entries(p)) {
      props[k] = props[k] || {};
      if (isPlainObject(v)) {
        Object.assign(props[k], v);
      } else {
        props[k] = v;
      }
    }
  });
  return props;
};

// 获取组件的 props 属性
const getOptionProps = instance => {
  if (instance.componentOptions) {
    const componentOptions = instance.componentOptions;
    const { propsData = {}, Ctor = {} } = componentOptions;
    const props = (Ctor.options || {}).props || {};
    const res = {};
    for (const [k, v] of Object.entries(props)) {
      const def = v.default;
      if (def !== undefined) {
        res[k] = typeof def === 'function' && getType(v.type) !== 'Function' ? def.call(instance) : def;
      }
    }
    return { ...res, ...propsData };
  }
  const { $options = {}, $props = {} } = instance;
  return filterProps($props, $options.propsData);
};

export { mergeProps, getOptionProps };
