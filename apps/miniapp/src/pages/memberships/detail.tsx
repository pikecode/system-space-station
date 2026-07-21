import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Button, Input } from '@tarojs/components';
import { membershipsApi, type MembershipRecord } from '../../services/memberships';
import { useAuthStore } from '../../store/auth';

const STATUS_LABELS: Record<string, string> = {
  PENDING: '待审核', APPROVED: '有效', REJECTED: '已拒绝',
  EXPIRED: '已到期', REFUND_PENDING: '退款审批中', REFUNDED: '已退款',
};
const STATUS_CLASS: Record<string, string> = {
  PENDING: 'tag--pending', APPROVED: 'tag--approved',
  REJECTED: 'tag--rejected', EXPIRED: 'tag--expired',
  REFUND_PENDING: 'tag--pending', REFUNDED: 'tag--expired',
};

export default function MembershipDetailPage() {
  const router = useRouter();
  const { id } = router.params;
  const user = useAuthStore((s) => s.user);

  const [record, setRecord] = useState<MembershipRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showRefundInput, setShowRefundInput] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));

  const load = async () => {
    if (!id) return;
    try {
      const data = await membershipsApi.getAll();
      const found = data.data?.find?.((m) => m.id === id) ?? null;
      setRecord(found);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const doApprove = async () => {
    setActionLoading(true);
    try {
      await membershipsApi.approve(id!, { paidAt });
      Taro.showToast({ title: '审批通过', icon: 'success' });
      load();
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally { setActionLoading(false); }
  };

  const doReject = async () => {
    if (!reviewNote.trim()) { Taro.showToast({ title: '请填写拒绝原因', icon: 'none' }); return; }
    setActionLoading(true);
    try {
      await membershipsApi.reject(id!, { reviewNote });
      Taro.showToast({ title: '已拒绝', icon: 'success' });
      load(); setShowRejectInput(false);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally { setActionLoading(false); }
  };

  const doRefund = async () => {
    if (!refundReason.trim()) { Taro.showToast({ title: '请填写退款原因', icon: 'none' }); return; }
    setActionLoading(true);
    try {
      await membershipsApi.requestRefund(id!, { refundReason });
      Taro.showToast({ title: '退款申请已提交', icon: 'success' });
      load(); setShowRefundInput(false);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally { setActionLoading(false); }
  };

  const doApproveRefund = async () => {
    setActionLoading(true);
    try {
      await membershipsApi.approveRefund(id!);
      Taro.showToast({ title: '退款已通过', icon: 'success' });
      load();
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally { setActionLoading(false); }
  };

  if (loading) return <View className='loading'>加载中…</View>;
  if (!record) return <View className='empty'>记录不存在</View>;

  const isHead = user?.role === 'HEAD';
  const canApprove = isHead && record.status === 'PENDING';
  const canApproveRefund = isHead && record.status === 'REFUND_PENDING';
  const canRefund = record.status === 'APPROVED';

  return (
    <View className='page' style={{ paddingBottom: '200rpx' }}>
      <ScrollView scrollY style={{ height: '100vh' }}>
        <View className='card' style={{ margin: '24rpx' }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16rpx' }}>
            <Text style={{ fontSize: '30rpx', fontWeight: '600' }}>{record.memberNo}</Text>
            <Text className={`tag ${STATUS_CLASS[record.status] ?? ''}`}>{STATUS_LABELS[record.status] ?? record.status}</Text>
          </View>
          {[
            { label: '客户', value: record.customer?.name },
            { label: '手机', value: record.customer?.phone },
            { label: '等级', value: record.memberLevel?.name },
            { label: '会员费', value: `¥${Number(record.fee).toLocaleString()}` },
            { label: '有效期', value: `${record.startDate?.slice(0, 10)} ~ ${record.endDate?.slice(0, 10)}` },
            { label: '申请人', value: record.submitter?.name },
            { label: '审批备注', value: record.reviewNote },
            { label: '退款原因', value: record.refundReason },
          ].map(({ label, value }) => value ? (
            <View key={label} className='row'>
              <Text className='row__label'>{label}</Text>
              <Text className='row__value'>{value}</Text>
            </View>
          ) : null)}
        </View>

        {showRejectInput && (
          <View style={{ margin: '0 24rpx 16rpx' }}>
            <Input
              style={{ background: '#fff', padding: '24rpx', borderRadius: '12rpx', fontSize: '28rpx' }}
              placeholder='请输入拒绝原因'
              value={reviewNote}
              onInput={(e) => setReviewNote(e.detail.value)}
            />
          </View>
        )}

        {showRefundInput && (
          <View style={{ margin: '0 24rpx 16rpx' }}>
            <Input
              style={{ background: '#fff', padding: '24rpx', borderRadius: '12rpx', fontSize: '28rpx' }}
              placeholder='请输入退款原因'
              value={refundReason}
              onInput={(e) => setRefundReason(e.detail.value)}
            />
          </View>
        )}
      </ScrollView>

      <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', padding: '24rpx 32rpx', borderTop: '1rpx solid #f0f1f3', display: 'flex', gap: '16rpx' }}>
        {canApprove && !showRejectInput && (
          <>
            <Button style={{ flex: 1, background: '#f5222d', color: '#fff', borderRadius: '12rpx' }} onClick={() => setShowRejectInput(true)}>拒绝</Button>
            <Button style={{ flex: 2, background: '#00a3a3', color: '#fff', borderRadius: '12rpx' }} loading={actionLoading} onClick={doApprove}>通过</Button>
          </>
        )}
        {showRejectInput && (
          <>
            <Button style={{ flex: 1, background: '#f5f6f8', color: '#666', borderRadius: '12rpx' }} onClick={() => setShowRejectInput(false)}>取消</Button>
            <Button style={{ flex: 2, background: '#f5222d', color: '#fff', borderRadius: '12rpx' }} loading={actionLoading} onClick={doReject}>确认拒绝</Button>
          </>
        )}
        {canApproveRefund && (
          <Button style={{ flex: 1, background: '#00a3a3', color: '#fff', borderRadius: '12rpx' }} loading={actionLoading} onClick={doApproveRefund}>通过退款</Button>
        )}
        {canRefund && !showRefundInput && (
          <Button style={{ flex: 1, background: '#fff', color: '#f5222d', border: '2rpx solid #f5222d', borderRadius: '12rpx' }} onClick={() => setShowRefundInput(true)}>申请退款</Button>
        )}
        {showRefundInput && (
          <>
            <Button style={{ flex: 1, background: '#f5f6f8', color: '#666', borderRadius: '12rpx' }} onClick={() => setShowRefundInput(false)}>取消</Button>
            <Button style={{ flex: 2, background: '#f5222d', color: '#fff', borderRadius: '12rpx' }} loading={actionLoading} onClick={doRefund}>提交退款</Button>
          </>
        )}
      </View>
    </View>
  );
}
