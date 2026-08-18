import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Button, Picker, Textarea } from '@tarojs/components';
import { membershipsApi, type MembershipRecord } from '../../services/memberships';
import { useAuthStore } from '../../store/auth';
import { useRequireLogin } from '../../hooks/useRequireLogin';

const STATUS_LABELS: Record<string, string> = {
  PENDING: '待审核',
  APPROVED: '待缴费',
  PAID: '正式会员',
  REJECTED: '已拒绝',
  EXPIRED: '已到期',
  REFUND_PENDING: '退款审批中',
  REFUNDED: '已退款',
};
const STATUS_CLASS: Record<string, string> = {
  PENDING: 'tag--pending',
  APPROVED: 'tag--pending',
  PAID: 'tag--approved',
  REJECTED: 'tag--rejected',
  EXPIRED: 'tag--expired',
  REFUND_PENDING: 'tag--pending',
  REFUNDED: 'tag--expired',
};

type InfoItem = { label: string; value?: string | number | null };

function InfoSection({ title, items }: { title: string; items: InfoItem[] }) {
  const visibleItems = items.filter(({ value }) => value !== undefined && value !== null && value !== '');
  if (visibleItems.length === 0) return null;

  return (
    <>
      <View className='section-title'>{title}</View>
      <View className='surface'>
        {visibleItems.map(({ label, value }) => (
          <View key={label} className='row'>
            <Text className='row__label'>{label}</Text>
            <Text className='row__value'>{value}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

export default function MembershipDetailPage() {
  const router = useRouter();
  const { id } = router.params;
  const user = useAuthStore((s) => s.user);
  const authorized = useRequireLogin();

  const [record, setRecord] = useState<MembershipRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showRefundInput, setShowRefundInput] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));

  const load = async () => {
    if (!authorized || !id) return;
    setLoading(true);
    try {
      const data = await membershipsApi.getOne(id);
      setRecord(data);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [authorized, id]);

  const doApprove = async () => {
    if (!paidAt) {
      Taro.showToast({ title: '请选择实际收款时间', icon: 'none' });
      return;
    }
    setActionLoading(true);
    try {
      await membershipsApi.approve(id!, { paidAt });
      Taro.showToast({ title: '审批通过', icon: 'success' });
      await load();
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const doReject = async () => {
    if (!reviewNote.trim()) {
      Taro.showToast({ title: '请填写拒绝原因', icon: 'none' });
      return;
    }
    setActionLoading(true);
    try {
      await membershipsApi.reject(id!, { reviewNote });
      Taro.showToast({ title: '已拒绝', icon: 'success' });
      setShowRejectInput(false);
      await load();
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const doRefund = async () => {
    if (!refundReason.trim()) {
      Taro.showToast({ title: '请填写退款原因', icon: 'none' });
      return;
    }
    setActionLoading(true);
    try {
      await membershipsApi.requestRefund(id!, { refundReason });
      Taro.showToast({ title: '退款申请已提交', icon: 'success' });
      setShowRefundInput(false);
      await load();
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const doApproveRefund = async () => {
    setActionLoading(true);
    try {
      await membershipsApi.approveRefund(id!);
      Taro.showToast({ title: '退款已通过', icon: 'success' });
      await load();
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  if (!authorized) return <View className='loading'>跳转登录中...</View>;
  if (loading) {
    return (
      <View className='page'>
        <View className='status-panel'>
          <Text className='status-panel__desc'>正在加载会员记录...</Text>
        </View>
      </View>
    );
  }
  if (!record) {
    return (
      <View className='page'>
        <View className='status-panel'>
          <View className='status-panel__mark'>!</View>
          <Text className='status-panel__title'>记录不存在</Text>
          <Text className='status-panel__desc'>该会员记录可能已删除或当前账号无权查看</Text>
        </View>
      </View>
    );
  }

  const isHead = user?.role === 'HEAD';
  const canApprove = isHead && record.status === 'PENDING';
  const canApproveRefund = isHead && record.status === 'REFUND_PENDING';
  const canRefund = record.status === 'PAID';
  const hasActions = canApprove || canApproveRefund || canRefund || showRejectInput || showRefundInput;
  const customerName = record.customer?.name || '未命名客户';

  return (
    <View className={`page ${hasActions ? 'page--with-actions' : ''}`}>
      <ScrollView scrollY className='page-scroll'>
        <View className='identity-band'>
          <View className='avatar avatar--large'>{customerName.slice(0, 1)}</View>
          <View className='identity-band__body'>
            <Text className='identity-band__eyebrow'>会员记录</Text>
            <Text className='identity-band__title'>{customerName}</Text>
            <Text className='identity-band__meta'>{record.memberNo || '会员编号待生成'}</Text>
          </View>
          <Text className={`tag ${STATUS_CLASS[record.status] ?? 'tag--neutral'}`}>
            {STATUS_LABELS[record.status] ?? record.status}
          </Text>
        </View>

        <InfoSection
          title='会员信息'
          items={[
            { label: '会员等级', value: record.memberLevel?.name },
            { label: '会员费', value: `¥${Number(record.fee).toLocaleString()}` },
            { label: '有效期', value: `${record.startDate?.slice(0, 10)} 至 ${record.endDate?.slice(0, 10)}` },
            { label: '实际收款', value: record.paidAt?.slice(0, 10) },
          ]}
        />

        <InfoSection
          title='流程信息'
          items={[
            { label: '申请人', value: record.submitter?.name },
            { label: '审批备注', value: record.reviewNote },
            { label: '退款原因', value: record.refundReason },
          ]}
        />

        {canApprove && !showRejectInput && (
          <>
            <View className='section-title'>审批信息</View>
            <View className='surface'>
              <Picker mode='date' value={paidAt} onChange={(e) => setPaidAt(e.detail.value)}>
                <View className='field'>
                  <Text className='field__label'>实际收款日期</Text>
                  <View className='field__value'>
                    <Text>{paidAt}</Text>
                    <Text className='field__arrow'>›</Text>
                  </View>
                </View>
              </Picker>
            </View>
          </>
        )}

        {showRejectInput && (
          <>
            <View className='section-title'>拒绝原因</View>
            <View className='surface surface--padded'>
              <Textarea
                className='textarea-field'
                placeholder='请说明拒绝原因，便于申请人修改后重新提交'
                maxlength={300}
                value={reviewNote}
                onInput={(e) => setReviewNote(e.detail.value)}
              />
            </View>
          </>
        )}

        {showRefundInput && (
          <>
            <View className='section-title'>退款原因</View>
            <View className='surface surface--padded'>
              <Textarea
                className='textarea-field'
                placeholder='请填写退款原因'
                maxlength={300}
                value={refundReason}
                onInput={(e) => setRefundReason(e.detail.value)}
              />
            </View>
          </>
        )}

        <View className='page-tail-space' />
      </ScrollView>

      {hasActions && (
        <View className='bottom-actions'>
          {canApprove && !showRejectInput && (
            <>
              <Button
                className='btn btn--danger-secondary'
                disabled={actionLoading || undefined}
                onClick={() => setShowRejectInput(true)}
              >
                拒绝
              </Button>
              <Button
                className='btn btn--primary btn--prominent'
                disabled={actionLoading || undefined}
                loading={actionLoading}
                onClick={doApprove}
              >
                审批通过
              </Button>
            </>
          )}
          {showRejectInput && (
            <>
              <Button
                className='btn btn--quiet'
                disabled={actionLoading || undefined}
                onClick={() => setShowRejectInput(false)}
              >
                取消
              </Button>
              <Button
                className='btn btn--danger btn--prominent'
                disabled={actionLoading || undefined}
                loading={actionLoading}
                onClick={doReject}
              >
                确认拒绝
              </Button>
            </>
          )}
          {canApproveRefund && (
            <Button
              className='btn btn--primary'
              disabled={actionLoading || undefined}
              loading={actionLoading}
              onClick={doApproveRefund}
            >
              通过退款
            </Button>
          )}
          {canRefund && !showRefundInput && (
            <Button
              className='btn btn--danger-secondary'
              disabled={actionLoading || undefined}
              onClick={() => setShowRefundInput(true)}
            >
              申请退款
            </Button>
          )}
          {showRefundInput && (
            <>
              <Button
                className='btn btn--quiet'
                disabled={actionLoading || undefined}
                onClick={() => setShowRefundInput(false)}
              >
                取消
              </Button>
              <Button
                className='btn btn--danger btn--prominent'
                disabled={actionLoading || undefined}
                loading={actionLoading}
                onClick={doRefund}
              >
                提交退款
              </Button>
            </>
          )}
        </View>
      )}
    </View>
  );
}
