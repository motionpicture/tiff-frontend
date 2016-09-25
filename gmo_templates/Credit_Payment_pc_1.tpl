<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>

	<meta http-equiv="Content-Type" content="text/html; charset=shift_jis" />
	<meta http-equiv="Content-style-Type" content="text/html; charset=Shift_JIS" />
	<title>�N���W�b�g���ϓ��̓e���v���[�g�T���v���@�o�f�}���`�y�C�����g�T�[�r�X</title>
	
	<link href="{$CSSPATH}/common.css" rel="stylesheet" type="text/css" />
	
	{literal}
	<script type="text/javascript">
		var submitted = false
		function blockForm(){
			if( submitted ){
				return false
			}
			submitted = true
			return true
		}
	</script>
	{/literal}
</head>

<body>

<div class="wrapper">
<div class="bodyinner">

	<!--�w�b�_�[�J�n-->
	<div class="header">
		<h1>{$ShopName|htmlspecialchars } ���x���葱��</h1>
	</div>

	<div class="flow">
		<ul>
			<li class="active">
				<a href="{$CancelURL|htmlspecialchars}">
					<span>�V���b�s���O�T�C�g�ɖ߂� &lt;</span>
				</a>
			</li>
			{if $SelectURL ne null}
			<li  class="active">
				<a href="{$SelectURL|htmlspecialchars}">
					<span>���x�����@�̑I�� &gt;</span>
				</a>
			</li>
			{/if}
			<li  class="current">
				<span>�K�v�������L�� &gt;</span>
			</li>
			{if $Confirm eq '1'}
			<li>
				<span>�m�F���Ď葱�� &gt;</span>
			</li>
			{/if}
			<li>
				<span>���x���葱������</span>
			</li>
		</ul>
	</div>
	
	<div class="main">

		{if  $CheckMessageArray neq null }
		<div id="GP_msg">
			<ul>
			{foreach item=message from=$CheckMessageArray}
				<li>{$message}</li>
			{/foreach}
			</ul>
		</div>
		{/if}
	
		<form action="{$ExecURL|htmlspecialchars}" onsubmit="return blockForm()" method="post">
		
			<p>{insert name="input_keyItems"}</p>
			
			<div class="block">
				<div class="bl_title">
					<div class="bl_title_inner">
						<h2>
							<span class="p">�N���W�b�g�J�[�h���ς̕K�v���������L�����������B</span>
						</h2>
					</div>
				</div>
				
				<div class="bl_body">
					
					<table class="generic" summary="credit_1" id="credit">
						<tr>
							<th>���x�������@<br />Total payment</th>
							<td>
								{insert name="select_payMethodList"}
							</td>
						</tr>
						<tr>
							<th>
								������<br /><span class="note">���x�������@�������̏ꍇ�A�K���I�����Ă��������B</span><br />
								Number of installments<br /><span class="note">Be sure to select one to make an installment payment. </span>
							</th>
							<td>
								{insert name="select_payTimesList"}
							</td>
						</tr>
						{if $MemberCardArray ne null}
							<tr>
								<th class="td_bl2">
									�J�[�h�̎w����@��I�����Ă��������B
								</th>
								<td>
									{insert name="radio_paymentMode"}
								</td>
							</tr>
							<tr>
								<th class="inner_label" colspan="2">
									�J�[�h�ԍ�����͂��Č��ς���ꍇ�A�ȉ��̓��e����͂��Ă��������B
								</th>
							</tr>
						{/if}
						<tr>
							<th>
								�J�[�h�ԍ�<br /><span class="note">�n�C�t���f-�f�����ŁA�����݂̂��L�����������B</span><br />
								Card number<br /><span class="note">Only enter numerals. Do not enter hyphens.</span>
							</th>
							<td><input name="CardNo" type="text" id="Name" value="{$CardNo|htmlspecialchars}" class="code" maxlength="16" size="20"/></td>
						</tr>
						<tr>
							<th>�J�[�h�L������<br />Expiration date</th>
						<td>
							{insert name="select_expireList"}
						</td>
					</tr>
					<tr>
						<th>�Z�L�����e�B�R�[�h<br />Security code</th>
						<td><input name="SecurityCode" type="text" id="SecurityCode" value="{$SecurityCode|htmlspecialchars}" class="code" maxlength="4" size="6" /></td>
					</tr>
					{if $MemberCardArray ne null}
						<tr>
							<th class="inner_label" colspan="2">
								�o�^�J�[�h�Ō��ς���ꍇ�A�ȉ��̓��e����͂��Ă��������B
							</th>
						</tr>
						<tr>
							<th class="td_bl2">�����p�ɂȂ�J�[�h��I�����Ă��������B</th>
							<td>{insert name="select_memberCardList"}</td>
						</tr>
						<tr>
							<th class="td_bl2">�J�[�h�ɐݒ肵���p�X���[�h�����L�����������B
								<p class="GPNotion">�ݒ肵�Ă��Ȃ��ꍇ�A�󗓂ɂ��Ă��������B</p>
							</th>
							<td id="card_pass_input">
							<input type="password" name="CardPass" size="20" maxlength="20" /><br />
							�m�F�p�ɍēx���́F<input type="password" name="CardPassConf" size="20" maxlength="20" />
							</td>
						</tr>
					{/if}
					</table>
					<p class="control">
						<span class="submit">
							{if $Confirm eq "1"}
							<input type="submit" value="�m�F����" />
							{else}
							<input type="submit" value="���ς���" />
							{/if}
						</span>
					</p>
				</div>
			</div>

			<div class="block">
				<div class="bl_title">
					<div class="bl_title_inner">
						<h2>
							<span class="p">�����p���e</span>
						</h2>
					</div>
				</div>
				
				<div class="bl_body">
		
					<div>
						<table id="cartinfo" class="generic">
							<tr>
								<th>���i��<br />Ticket price</th>
								<td>{$Amount|number_format|htmlspecialchars}�~</td>
							</tr>
							<tr>
								<th>�ő���<br />Tax and postage</th>
								<td>{$Tax|number_format|htmlspecialchars}�~</td>
							</tr>
							<tr>
								<th>���x�����v<br />Total payment</th>
								<td>{$Total|number_format|htmlspecialchars}�~</td>
							</tr>
						</table>
					</div>
					
				</div>
				
			</div>
						
			<br class="clear" />
			
		</form>
	</div>

</div>
</div>
{* �f�o�b�O���K�v�ȏꍇ�A�ȉ��̍s�� * ���폜���āA�R�����g���O���Ă��������B *}
{*insert name="debug_showAllVars"*}
</body>
</html>