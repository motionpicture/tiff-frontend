<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>

	<meta http-equiv="Content-Type" content="text/html; charset=shift_jis" />
	<meta http-equiv="Content-style-Type" content="text/html; charset=Shift_JIS" />
	<title>�R���r�j�G���X�X�g�A���σ��V�[�g�e���v���[�g�T���v���@�o�f�}���`�y�C�����g�T�[�r�X</title>

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
			<li>
				<span>�V���b�s���O�T�C�g�ɖ߂� &lt;</span>
			</li>
			{if $SelectURL ne null}
			<li>
				<span>���x�����@�̑I�� &gt;</span>
			</li>
			{/if}
			<li>
				<span>�K�v�������L�� &gt;</span>
			</li>
			{if $Confirm eq "1"}
			<li>
				<span>�m�F���Ď葱�� &gt;</span>
			</li>
			{/if}
			<li class="current">
				<span>���x�����@�̂��ē�</span>
			</li>
		</ul>
	</div>

	<div class="main">
		<p class="txt">�R���r�j�G���X�X�g�A���x�����\�����݂��������܂����B���L�̎菇�ł��x�������������B</p>
		<p class="txt">���x�����̍ہA���̃y�[�W�ɋL�ڂ��ꂽ�ԍ����K�v�ɂȂ�܂��B��������邩�A���̃y�[�W��������Ă��������������B</p>

		{if $CvsCode ne '00007' && $CvsCode ne '10001' && $CvsCode ne '10002' && $CvsCode ne '10005'}
		<div class="block">
			<div class="bl_title">
				<div class="bl_title_inner">
					<h2>
						<span class="p">���[�\���^�~�j�X�g�b�v�ł��x�����̏ꍇ</span>
					</h2>
				</div>
			</div>
			<div class="bl_body">
				<dl class="allocated_numbers warn" id="cvs_l_f_numbers">
					<dt>���q�l�ԍ�</dt>
					<dd>{$CvsReceiptNo|htmlspecialchars}</dd>
					<dt>�m�F�ԍ�</dt>
					<dd>{$CvsConfNo|htmlspecialchars}</dd>
				</dl>
				<div class="information" id="cvs_l_f_info">
					���x�����̑O�ɂ��ǂ݂�������
					<ul>
						<li>Loppi�̂��郍�[�\���A�܂��̓~�j�X�g�b�v�S�X�ł��x�������������܂��B<br />Loppi�Ő\�����𔭍s���Ă���30���ȓ��Ƀ��W�ł��x�������������B</li>
						<li>���x�����̍ہA���q�l�ԍ��Ɗm�F�ԍ����K�v�ł��B<br />��������邩�A���̃y�[�W��������āA�R���r�j�܂ł��������������B</li>
						<li>�戵���׌���̏����̎����ƂȂ�܂��̂ŁA���x������K�����󂯎�肭�������B</li>
					</ul>
					<p class="note">
					��30���~�𒴂��邨�x�����͂ł��܂���B<br />
					���R���r�j�X���ł̂��x�����ɂ͊y�VEdy�͂����p���������܂���B�����ł��x�������������B
					</p>
					<dl>
						<dd>
							<ol>
								<li>�g�b�v�y�[�W���u�e��T�[�r�X���j���[�v��I�����Ă��������B</li>
								<li>�ォ��4�Ԗ�  ���}�[�N�̃{�^���u�e�����E�������x����/�`�v��I�����Ă��������B</li>
								<li>�����āu�e�������x�����v��I�����Ă��������B</li>
								<li>�u�e�������x�����v�̃y�[�W�Łu�}���`�y�C�����g�T�[�r�X�v��I�����Ă��������B</li>
								<li>�T�[�r�X���e�����m�F��A��낵����΁u�͂��v��I�����Ă��������B</li>
								<li>���q�l�ԍ� ����͂��A�u���ցv��I�����Ă��������B</li>
								<li>�m�F�ԍ� ����͂��A�u���ցv��I�����Ă��������B</li>
								<li>�\���������e���m�F�̂����A�u�����v��I�����Ă��������B</li>
								<li>���x�������̒��ӎ��������m�F��A��낵����΁u�͂��v��I�����Ă��������B</li>
								<li>������ꂽ�\���������W�ɓn���A30���ȓ��Ɍ����ł��x�������������B</li>
								<li>���x������A�u�戵���׌���̏��v��K�����󂯎�肭�������B</li>
							</ol>
						</dd>
					</dl>
				</div>
			</div>
		</div>

		<div class="block">
			<div class="bl_title">
				<div class="bl_title_inner">
					<h2>
						<span class="p">�t�@�~���[�}�[�g�ł��x�����̏ꍇ</span>
					</h2>
				</div>
			</div>
			<div class="bl_body">
				<dl class="allocated_numbers warn" id="cvs_l_f_numbers">
					<dt>���q�l�ԍ�</dt>
					<dd>{$CvsReceiptNo|htmlspecialchars}</dd>
					<dt>�m�F�ԍ�</dt>
					<dd>{$CvsConfNo|htmlspecialchars}</dd>
				</dl>
				<div class="information" id="cvs_l_f_info">
					���x�����̑O�ɂ��ǂ݂�������
					<ul>
						<li>Fami�|�[�g�̂���t�@�~���[�}�[�g�S�X�ł��x�������������܂��B<br />Fami�|�[�g�Ő\�����𔭍s���Ă���30���ȓ��Ƀ��W�ł��x�������������B</li>
						<li>���x�����̍ہA���q�l�ԍ��Ɗm�F�ԍ����K�v�ł��B<br />��������邩�A���̃y�[�W��������āA�R���r�j�܂ł��������������B</li>
						<li>�戵���׌���̏����̎����ƂȂ�܂��̂ŁA���x������K�����󂯎�肭�������B</li>
					</ul>
					<p class="note">
					��30���~�𒴂��邨�x�����͂ł��܂���B<br />
					���R���r�j�X���ł̂��x�����ɂ͊y�VEdy�͂����p���������܂���B�����ł��x�������������B
					</p>
					<dl>
						<dd>
							<ol>
								<li>�g�b�v�y�[�W���u�R���r�j�ł��x�����v��I�����Ă��������B</li>
								<li>�u������x�����v�̃y�[�W�Łu�e��ԍ����������̕��͂�����v��I�����Ă��������B</li>
								<li>���q�l�ԍ� ����͂��A�uOK�v��I�����Ă��������B</li>
								<li>�m�F�ԍ� ����͂��A�uOK�v��I�����Ă��������B</li>
								<li>���x�������e���m�F�̂����A�u�m�F�v��I�����Ă��������B</li>
								<li>������ꂽ�\���������W�ɓn���A30���ȓ��Ɍ����ł��x�������������B</li>
								<li>���x������A�u�戵���׌���̏��v��K�����󂯎�肭�������B</li>
							</ol>
						</dd>
					</dl>
				</div>
			</div>
		</div>

		<div class="block">
			<div class="bl_title">
				<div class="bl_title_inner">
					<h2>
						<span class="p">�T�[�N���j�T���N�X�ł��x�����̏ꍇ</span>
					</h2>
				</div>
			</div>
			<div class="bl_body">
				<dl class="allocated_numbers warn" id="cvs_l_f_numbers">
					<dt>���q�l�ԍ�</dt>
					<dd>{$CvsReceiptNo|htmlspecialchars}</dd>
					<dt>�m�F�ԍ�</dt>
					<dd>{$CvsConfNo|htmlspecialchars}</dd>
				</dl>
				<div class="information" id="cvs_l_f_info">
					���x�����̑O�ɂ��ǂ݂�������
					<ul>
						<li>�j�X�e�[�V�����̂���T�[�N���j�T���N�X�S�X�ł��x�������������܂��B<br />�j�X�e�[�V�����Ő\�����𔭍s���Ă���30���ȓ��Ƀ��W�ł��x�������������B</li>
						<li>���x�����̍ہA���q�l�ԍ��Ɗm�F�ԍ����K�v�ł��B<br />��������邩�A���̃y�[�W��������āA�R���r�j�܂ł��������������B</li>
						<li>�戵���׌���̏����̎����ƂȂ�܂��̂ŁA���x������K�����󂯎�肭�������B</li>
					</ul>
					<p class="note">
					��30���~�𒴂��邨�x�����͂ł��܂���B<br />
					���R���r�j�X���ł̂��x�����ɂ͊y�VEdy�͂����p���������܂���B�����ł��x�������������B
					</p>
					<dl>
						<dd>
							<ol>
								<li>�g�b�v�y�[�W����ʒ��������́u�e��x�����v��I�����Ă��������B</li>
								<li>�u11�P�^���̔ԍ����������̕��v��I�����Ă��������B</li>
								<li>�u�e�������x�����i���x�����̑I���j�v�̃y�[�W�Łu�}���`�y�C�����g�T�[�r�X�v��I�����Ă��������B</li>
								<li>�T�[�r�X��t�����܂ł̗�����m�F�̂����A�u���ɐi�ށv��I�����Ă��������B</li>
								<li>���q�l�ԍ� ����͂��A�u���ɐi�ށv��I�����Ă��������B</li>
								<li>�m�F�ԍ� ����͂��A�u���ɐi�ށv��I�����Ă��������B</li>
								<li>���͏��ɊԈႢ���Ȃ������m�F�̂����A�u���ɐi�ށv��I�����Ă��������B</li>
								<li>���x�������e���m�F�̂����A�u���ɐi�ށv��I�����Ă��������B</li>
								<li>������ꂽ�\���������W�ɓn���A30���ȓ��Ɍ����ł��x�������������B</li>
								<li>���x������A�u�戵���׌���̏��v��K�����󂯎�肭�������B</li>
							</ol>
						</dd>
					</dl>
				</div>
			</div>
		</div>

		<div class="block">
			<div class="bl_title">
				<div class="bl_title_inner">
					<h2>
						<span class="p">�Z�C�R�[�}�[�g�ł��x�����̏ꍇ</span>
					</h2>
				</div>
			</div>
			<div class="bl_body">
				<dl class="allocated_numbers warn" id="cvs_l_f_numbers">
					<dt>�I�����C�����ϔԍ�</dt>
					<dd>{$CvsReceiptNo_Format|htmlspecialchars}</dd>
				</dl>
				<div class="information" id="cvs_l_f_info">
					���x�����̑O�ɂ��ǂ݂�������
					<ul>
						<li>�N���u�X�e�[�V�����̂���Z�C�R�[�}�[�g�S�X�ł��x�������������܂��B<br />�N���u�X�e�[�V�����Ő\�����𔭍s���Ă���30���ȓ��Ƀ��W�ł��x�������������B</li>
						<li>���x�����̍ہA�I�����C�����ϔԍ����K�v�ł��B<br />��������邩�A���̃y�[�W��������āA�R���r�j�܂ł��������������B</li>
						<li>�戵���׌���̏����̎����ƂȂ�܂��̂ŁA���x������K�����󂯎�肭�������B</li>
					</ul>
					<p class="note">
					��30���~�𒴂��邨�x�����͂ł��܂���B<br />
					���R���r�j�X���ł̂��x�����ɂ͊y�VEdy�͂����p���������܂���B�����ł��x�������������B
					</p>
					<dl>
						<dd>
							<ol>
								<li>�g�b�v�y�[�W��荶���̃{�^���u�C���^�[�l�b�g��t�@�e�������x�����v��I�����Ă��������B</li>
								<li>�u�I�����C�����ϔԍ��i11���j�v�̃n�C�t���������ē��͂��A�u���̃y�[�W�v��I�����Ă��������B</li>
								<li>���͏��ɊԈႢ���Ȃ������m�F�̂����A�u���̃y�[�W�v��I�����Ă��������B</li>
								<li>���x�������e���m�F�̂����A�u����v��I�����Ă��������B</li>
								<li>������ꂽ��t�[�����W�ɓn���A30���ȓ��Ɍ����ł��x�������������B</li>
								<li>���x������A�u�戵���׌���̏��v��K�����󂯎�肭�������B</li>
							</ol>
						</dd>
					</dl>
				</div>
			</div>
		</div>

		<div class="block">
			<div class="bl_title">
				<div class="bl_title_inner">
					<h2>
						<span class="p">�f�C���[���}�U�L�^�X���[�G�t�ł��x�����̏ꍇ</span>
					</h2>
				</div>
			</div>
			<div class="bl_body information">
				<dl class="allocated_numbers warn" id="cvs_l_f_numbers">
					<dt>�I�����C�����ϔԍ�</dt>
					<dd>{$CvsReceiptNo_Format|htmlspecialchars}</dd>
				</dl>
				<div class="information">
				���x�����̑O�ɂ��ǂ݂�������
					<ul>
						<li>�u�I�����C�����ρv�ƓX���ɂ��`�����������B
							�f�C���[���}�U�L�Ɠ��n��̃��}�U�L�f�C���[�X�g�A�[�ł����x�������������܂��B
							���x�������@�̓f�C���[���}�U�L�Ɠ��l�ł��B</li>
						<li>���x�����̍ہA�I�����C�����ϔԍ����K�v�ł��B
							��������邩�A���̃y�[�W��������āA�R���r�j�܂ł��������������B</li>
						<li>�戵���׌���̏����̎����ƂȂ�܂��̂ŁA���x������K�����󂯎�肭�������B</li>
					</ul>
					<p class="note">
					��30���~�𒴂��邨�x�����͂ł��܂���B<br />
					���R���r�j�X���ł̂��x�����ɂ͊y�VEdy�͂����p���������܂���B�����ł��x�������������B
					</p>
					<ol>
						<li>�R���r�j�̃��W�X�^�b�t�ɁA��L�I�����C�����ϔԍ������񎦂��Ē����A�u�I�����C�����ρv��]�Ƃ��`�����������B</li>
						<li>�X�^�b�t�����W�𑀍��ɁA���͉�ʂ��\������܂��̂ŁA���q�l���I�����C�����ϔԍ��������͂��������B</li>
						<li>���x�������e���\������܂��̂ŁA���e�����������Ƃ����m�F�̂����A�u�m��v�������Ă��������B</li>
						<li>�����ŏ��i��������x�������������B</li>
						<li>�̎���(���V�[�g�`��)�����s����܂��̂ŁA�K�����󂯎�肭�������B</li>
					</ol>
				</div>
			</div>
		</div>
		{/if}

		{if $CvsCode eq '00007'}
		<div class="block">
			<div class="bl_title">
				<div class="bl_title_inner">
					<h2>
						<span class="p">�Z�u���C���u���ł̂��x�������@</span>
					</h2>
				</div>
			</div>
			<div class="bl_body information">
				<div class="information">
					�����[�ԍ����������čŊ�̃Z�u���C���u���̃��W�ɂĂ��x�������������B
					<dl class="allocated_numbers warn" id="cvs_l_f_numbers">
						<dt>�����[�ԍ�</dt>
						<dd>
							{$CvsReceiptNo|htmlspecialchars}
							{if $CvsReceiptUrl ne null}
							&nbsp;&nbsp;<a target="_blank" href="{$CvsReceiptUrl|htmlspecialchars}">[�����[�\��]</a>
							{/if}
						</dd>
						<dt>�x������</dt>
						<dd>
							{$PaymentTermYear|htmlspecialchars}�N{$PaymentTermMonth|htmlspecialchars}��{$PaymentTermDay|htmlspecialchars}��
						</dd>
					</dl>
				</div>
			</div>
		</div>
		{/if}

		{if $CvsCode eq '10001' || $CvsCode eq '10005'}
		<div class="block">
			<div class="bl_title">
				<div class="bl_title_inner">
					<h2>
						<span class="p">���[�\���^�~�j�X�g�b�v�ł��x�����̏ꍇ</span>
					</h2>
				</div>
			</div>
			<div class="bl_body">
				<dl class="allocated_numbers warn" id="cvs_l_f_numbers">
					<dt>���q�l�ԍ�</dt>
					<dd>{$CvsReceiptNo|htmlspecialchars}</dd>
					<dt>�m�F�ԍ�</dt>
					<dd>{$CvsConfNo|htmlspecialchars}</dd>
				</dl>
				<div class="information" id="cvs_l_f_info">
					���x�����̑O�ɂ��ǂ݂�������
					<ul>
						<li>Loppi�̂��郍�[�\���A�܂��̓~�j�X�g�b�v�S�X�ł��x�������������܂��B<br />Loppi�Ő\�����𔭍s���Ă���30���ȓ��Ƀ��W�ł��x�������������B</li>
						<li>���x�����̍ہA���q�l�ԍ��Ɗm�F�ԍ����K�v�ł��B<br />��������邩�A���̃y�[�W��������āA�R���r�j�܂ł��������������B</li>
						<li>�戵���׌���̏����̎����ƂȂ�܂��̂ŁA���x������K�����󂯎�肭�������B</li>
					</ul>
					<p class="note">
					��30���~�𒴂��邨�x�����͂ł��܂���B<br />
					���R���r�j�X���ł̂��x�����ɂ͊y�VEdy�͂����p���������܂���B�����ł��x�������������B
					</p>
					<dl>
						<dd>
							<ol>
								<li>�g�b�v�y�[�W���u�e��ԍ����������̕��v��I�����Ă��������B</li>
								<li>���q�l�ԍ� ����͂��u���ցv��I�����Ă��������B</li>
								<li>�m�F�ԍ� ����͂��A�u���ցv��I�����Ă��������B</li>
								<li>�\���������e���m�F�̂����A�u�͂��v��I�����Ă��������B</li>
								<li>������ꂽ�\���������W�ɓn���A30���ȓ��Ɍ����ł��x�������������B</li>
								<li>���x������A�u�戵���׌���̏��v��K�����󂯎�肭�������B</li>
							</ol>
						</dd>
					</dl>
				</div>
			</div>
		</div>
		{/if}

		{if $CvsCode eq '10002'}
		<div class="block">
			<div class="bl_title">
				<div class="bl_title_inner">
					<h2>
						<span class="p">�t�@�~���[�}�[�g�ł��x�����̏ꍇ</span>
					</h2>
				</div>
			</div>
			<div class="bl_body">
				<dl class="allocated_numbers warn" id="cvs_l_f_numbers">
					<dt>�m�F�ԍ�</dt>
					<dd>{$CvsConfNo|htmlspecialchars}</dd>
					<dt>���q�l�ԍ�</dt>
					<dd>{$CvsReceiptNo|htmlspecialchars}</dd>
				</dl>
				<div class="information" id="cvs_l_f_info">
					���x�����̑O�ɂ��ǂ݂�������
					<ul>
						<li>Fami�|�[�g�̂���t�@�~���[�}�[�g�S�X�ł��x�������������܂��B<br />Fami�|�[�g�Ő\�����𔭍s���Ă���30���ȓ��Ƀ��W�ł��x�������������B</li>
						<li>���x�����̍ہA���q�l�ԍ��Ɗm�F�ԍ����K�v�ł��B<br />��������邩�A���̃y�[�W��������āA�R���r�j�܂ł��������������B</li>
						<li>�戵���׌���̏����̎����ƂȂ�܂��̂ŁA���x������K�����󂯎�肭�������B</li>
					</ul>
					<p class="note">
					��30���~�𒴂��邨�x�����͂ł��܂���B<br />
					���R���r�j�X���ł̂��x�����ɂ͊y�VEdy�͂����p���������܂���B�����ł��x�������������B
					</p>
					<dl>
						<dd>
							<ol>
								<li>�g�b�v�y�[�W���u����x�����i�R���r�j�ł��x�����j�v��I�����Ă��������B</li>
								<li>�u������x�����v�̃y�[�W�Łu�e��ԍ����������̕��͂�����v��I�����Ă��������B</li>
								<li>�u�ԍ����͉�ʂɐi�ށv��I�����Ă��������B</li>
								<li>�m�F�ԍ�(5��) ����͂��A�uOK�v��I�����Ă��������B</li>
								<li>���q�l�ԍ�(12��) ����͂��A�uOK�v��I�����Ă��������B</li>
								<li>���x�������e���m�F�̂����A�u�m�F�v��I�����Ă��������B</li>
								<li>������ꂽ�\���������W�ɓn���A30���ȓ��ɂ��x�������������B</li>
								<li>���x������A�u�戵���׌���̏��v��K�����󂯎�肭�������B</li>
							</ol>
						</dd>
					</dl>
				</div>
			</div>
		</div>
		{/if}

		<div class="block">
			<div class="bl_title">
				<div class="bl_title_inner">
					<h2>
						<span class="p">�V���b�s���O�T�C�g�ɖ߂�</span>
					</h2>
				</div>
			</div>
			<div class="bl_body information">

				<p class="alert">���̃y�[�W�͍ĕ\���ł��܂���B</p>
				<p class="txt">
					{if $CvsCode eq '00007'}
						�����[�ԍ�
					{else}
						���q�l�ԍ��A�m�F�ԍ��A���q�l���ϔԍ�
					{/if}
					�̃����������ɂȂ邩�A���̃y�[�W��������܂������H</p>
				<form action="{$RetURL|htmlspecialchars}" method="post" onsubmit="return blockForm()">
					<p>{insert name="input_returnParams"}</p>
					<p class="control">
						<span class="submit">
							<input type="submit" value="�V���b�s���O�T�C�g�ɖ߂�" />
						</span>
					</p>
				</form>
				<br class="clear" />
			</div>
		</div>
	</div>

</div>
</div>
{* �f�o�b�O���K�v�ȏꍇ�A�ȉ��̍s�� * ���폜���āA�R�����g���O���Ă��������B *}
{*insert name="debug_showAllVars"*}
</body>
</html>