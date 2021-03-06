<script>
/**
 * @Author: 焦质晔
 * @Date: 2019-06-20 10:00:00
 * @Last Modified by: maguangyuan
 * @Last Modified time: 2020-03-26 17:15:27
 **/
import _ from 'lodash';

export default {
  name: 'Cascader',
  props: {
    value: {
      type: String
    },
    list: {
      type: Array,
      required: true,
      default: () => []
    },
    labels: {
      type: Array,
      default: () => []
    }
  },
  data() {
    this.prevValue = null;
    this.clicked = 'off'; // 点击状态
    return {
      currentValues: []
    };
  },
  computed: {
    dataList() {
      let res = [this.list];
      this.currentValues.forEach((x, i) => {
        const arr = res[i].find(k => k.value === x.value).children;
        if (typeof arr !== 'undefined' && Array.isArray(arr)) {
          res.push(arr);
        }
      });
      return res;
    }
  },
  watch: {
    currentValues(val) {
      if (val.length || !this.value) {
        if (_.isEqual(val, this.prevValue)) return;
        this.$emit('input', val);
        if (this.clicked === 'on') {
          this.clicked = 'off';
          this.$emit('change', val);
        }
        this.prevValue = [...val];
      }
    },
    value(val) {
      this.currentValues = this.createValues(val);
    },
    list() {
      this.currentValues = this.createValues(this.value);
    }
  },
  mounted() {
    this.currentValues = this.createValues(this.value);
  },
  methods: {
    createValues(valText) {
      let res = [];
      if (valText && _.isString(valText)) {
        const valStrList = valText.split(',');
        let arr = this.list;
        valStrList.forEach(x => {
          const target = arr.find(k => k.value === x);
          if (target) {
            res.push({ value: x, text: target.text });
            arr = target.children || [];
          }
        });
      }
      return res;
    },
    clickHandle(ev, index, { value, text, children }) {
      ev.stopPropagation();
      this.clicked = 'on';
      this.$set(this.currentValues, index, { value, text });
      this.currentValues.length = index + 1;
      if (!children) {
        this.$emit('close', false);
      }
    }
  },
  render() {
    const { labels, dataList, currentValues } = this;
    return (
      <div class="casc-wrap">
        <table class="table" width="100%">
          {labels.length ? (
            <tr>
              {labels.map(x => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          ) : null}
          <tr>
            {dataList.map((list, index) => (
              <td key={`td-${index}`}>
                {list.map(item => {
                  const actived = currentValues[index] && currentValues[index].value === item.value ? 'selected' : '';
                  return (
                    <li key={item.value} class={actived} onClick={ev => this.clickHandle(ev, index, item)}>
                      {item.text}
                      {Array.isArray(item.children) && item.children.length ? <i class="el-icon-arrow-right"></i> : null}
                    </li>
                  );
                })}
              </td>
            ))}
          </tr>
        </table>
      </div>
    );
  }
};
</script>

<style lang="less" scoped>
.casc-wrap {
  .table {
    tr {
      th {
        padding: 5px;
        text-align: left;
      }
      td {
        padding: 5px;
        li {
          list-style: none;
          line-height: 28px;
          cursor: pointer;
          position: relative;
          margin: 0 -5px;
          padding: 0 5px;
          padding-right: 20px;
          white-space: nowrap;
          i {
            position: absolute;
            right: 5px;
            top: 7px;
          }
          &:hover {
            background-color: #f5f7fa;
          }
          &.selected {
            color: @primaryColor;
          }
        }
      }
    }
  }
}
</style>
